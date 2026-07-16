package com.papermate.fetch.service;

import com.papermate.auth.entity.User;
import com.papermate.auth.repository.UserRepository;
import com.papermate.fetch.dto.CreateFetchTaskRequest;
import com.papermate.fetch.dto.FetchTaskDTO;
import com.papermate.fetch.entity.FetchTask;
import com.papermate.fetch.repository.FetchTaskRepository;
import com.papermate.library.entity.UserPaper;
import com.papermate.library.repository.UserPaperRepository;
import com.papermate.paper.entity.Paper;
import com.papermate.paper.repository.PaperRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 抓取任务的核心业务服务。
 *
 * <p>负责 FetchTask 的 CRUD、任务执行编排（ArxivClient → Paper 入库 → UserPaper 关联）、
 * 以及 {@code nextRunAt} 的计算。</p>
 *
 * <p>跨模块调用说明：本服务仅通过 Spring DI 注入其他模块的 <b>公开</b> Repository Bean，
 * 不修改任何外部模块的代码。</p>
 */
@Service
public class FetchService {

    private static final Logger log = LoggerFactory.getLogger(FetchService.class);

    private final FetchTaskRepository taskRepo;
    private final ArxivClient arxivClient;
    private final PaperRepository paperRepo;
    private final UserPaperRepository userPaperRepo;
    private final UserRepository userRepo;

    public FetchService(FetchTaskRepository taskRepo,
                        ArxivClient arxivClient,
                        PaperRepository paperRepo,
                        UserPaperRepository userPaperRepo,
                        UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.arxivClient = arxivClient;
        this.paperRepo = paperRepo;
        this.userPaperRepo = userPaperRepo;
        this.userRepo = userRepo;
    }

    // ─── CRUD ────────────────────────────────────────────────────

    /** 获取当前用户的所有抓取任务。 */
    public List<FetchTaskDTO> getTasks(Long userId) {
        return taskRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(FetchTaskDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** 创建抓取任务，自动计算 nextRunAt。 */
    @Transactional
    public FetchTaskDTO createTask(CreateFetchTaskRequest req, Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FetchTask task = FetchTask.builder()
                .name(req.getName())
                .user(user)
                .keywords(req.getKeywords())
                .category(req.getCategory())
                .freqPeriod(req.getFreqPeriod())
                .freqHour(req.getFreqHour() != null ? req.getFreqHour() : 9)
                .autoTags(req.getAutoTags())
                .status("active")
                .build();

        task.setNextRunAt(computeNextRun(task));
        task = taskRepo.save(task);
        log.info("Fetch task created: id={}, name=\"{}\", freqPeriod={}, nextRunAt={}",
                task.getId(), task.getName(), task.getFreqPeriod(), task.getNextRunAt());
        return FetchTaskDTO.fromEntity(task);
    }

    /** 编辑抓取任务（校验归属）。 */
    @Transactional
    public FetchTaskDTO updateTask(Long taskId, CreateFetchTaskRequest req, Long userId) {
        FetchTask task = findOwnTask(taskId, userId);

        task.setName(req.getName());
        task.setKeywords(req.getKeywords());
        task.setCategory(req.getCategory());
        task.setFreqPeriod(req.getFreqPeriod());
        task.setFreqHour(req.getFreqHour() != null ? req.getFreqHour() : task.getFreqHour());
        task.setAutoTags(req.getAutoTags());
        task.setNextRunAt(computeNextRun(task));

        task = taskRepo.save(task);
        log.info("Fetch task updated: id={}", task.getId());
        return FetchTaskDTO.fromEntity(task);
    }

    /** 删除抓取任务（校验归属）。 */
    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        FetchTask task = findOwnTask(taskId, userId);
        taskRepo.delete(task);
        log.info("Fetch task deleted: id={}", task.getId());
    }

    /** 立即执行一次抓取任务。 */
    @Transactional
    public void runTaskNow(Long taskId, Long userId) {
        FetchTask task = findOwnTask(taskId, userId);
        log.info("Manual run triggered for task: id={}, name=\"{}\"", task.getId(), task.getName());
        executeFetch(task);
    }

    /** 切换 active / paused 状态。 */
    @Transactional
    public FetchTaskDTO toggleStatus(Long taskId, Long userId) {
        FetchTask task = findOwnTask(taskId, userId);
        String newStatus = "active".equals(task.getStatus()) ? "paused" : "active";
        task.setStatus(newStatus);
        if ("active".equals(newStatus)) {
            task.setNextRunAt(computeNextRun(task));
        }
        task = taskRepo.save(task);
        log.info("Fetch task status toggled: id={}, status={}", task.getId(), task.getStatus());
        return FetchTaskDTO.fromEntity(task);
    }

    // ─── 抓取执行（internal，供调度器和立即执行共用）──────────────

    /**
     * 执行单个抓取任务：调 ArxivClient → 入库 → 更新执行时间。
     * 包可见，方便 ScheduledFetchTask 测试。
     */
    @Transactional
    public void executeFetch(FetchTask task) {
        log.info("Executing fetch task: id={}, name=\"{}\", keywords=\"{}\"",
                task.getId(), task.getName(), task.getKeywords());

        // 1. 调 arXiv API
        List<ArxivClient.ArxivPaper> papers = arxivClient.search(
                task.getKeywords(), task.getCategory());

        if (papers.isEmpty()) {
            log.info("No new papers found for task: id={}", task.getId());
            afterExecution(task);
            return;
        }

        // 2. 逐条入库（去重）
        int imported = 0;
        for (ArxivClient.ArxivPaper ap : papers) {
            if (tryImport(ap, task)) {
                imported++;
            }
        }

        log.info("Fetch task completed: id={}, found={}, imported={}",
                task.getId(), papers.size(), imported);

        // 3. 更新任务执行时间
        afterExecution(task);
    }

    // ─── 内部辅助方法 ────────────────────────────────────────────

    /** 查任务并校验归属。 */
    private FetchTask findOwnTask(Long taskId, Long userId) {
        FetchTask task = taskRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Fetch task not found: " + taskId));
        if (!task.getUser().getId().equals(userId)) {
            throw new SecurityException("Cannot modify another user's fetch task");
        }
        return task;
    }

    /** 尝试导入一篇论文，已存在则跳过。返回 true 表示成功入库。 */
    private boolean tryImport(ArxivClient.ArxivPaper ap, FetchTask task) {
        // 去重：按 arxivId 查是否已存在
        if (paperRepo.findOne(arxivIdSpec(ap.getArxivId())).isPresent()) {
            log.debug("Paper already exists, skipped: arxivId={}", ap.getArxivId());
            return false;
        }

        try {
            // 构建 Paper 实体
            Paper paper = Paper.builder()
                    .arxivId(ap.getArxivId())
                    .source("arxiv_fetch")
                    .sourceId("arxiv:" + ap.getArxivId())
                    .title(ap.getTitle())
                    .authors(ap.getAuthors())
                    .paperAbstract(ap.getSummary())
                    .category(ap.getCategory())
                    .publishedAt(ap.getPublishedAt())
                    .arxivUrl(ap.getArxivUrl())
                    .tags(task.getAutoTags())   // 应用任务的自动标签
                    .parseStatus("IMPORTED")
                    .build();

            paper = paperRepo.save(paper);

            // 建立用户-论文关联（标记为收藏）
            UserPaper up = new UserPaper();
            up.setUserId(task.getUser().getId());
            up.setPaperId(paper.getId());
            up.setFavorited(true);
            up.setStarred(false);
            up.setImportedAt(LocalDateTime.now());
            userPaperRepo.save(up);

            log.debug("Paper imported: arxivId={}, title=\"{}\"", ap.getArxivId(), ap.getTitle());
            return true;
        } catch (Exception e) {
            log.warn("Failed to import paper arxivId={}: {}", ap.getArxivId(), e.getMessage());
            return false;
        }
    }

    /** 任务执行后的状态更新。 */
    private void afterExecution(FetchTask task) {
        task.setLastRunAt(LocalDateTime.now());

        if ("once".equals(task.getFreqPeriod())) {
            // 一次性任务：执行后自动暂停
            task.setStatus("paused");
            task.setNextRunAt(null);
            log.info("One-time task auto-paused: id={}", task.getId());
        } else {
            task.setNextRunAt(computeNextRun(task));
        }

        taskRepo.save(task);
    }

    // ─── nextRunAt 计算 ──────────────────────────────────────────

    /**
     * 根据 {@code freqPeriod} 和 {@code freqHour} 计算下次执行时间。
     *
     * <ul>
     *   <li>{@code once} → {@code null}（仅执行一次）</li>
     *   <li>{@code daily} → 明天 {@code freqHour}:00</li>
     *   <li>{@code weekly} → 下周同一天 {@code freqHour}:00</li>
     *   <li>{@code monthly} → 下月同一天 {@code freqHour}:00</li>
     * </ul>
     */
    static LocalDateTime computeNextRun(FetchTask task) {
        String period = task.getFreqPeriod();
        Integer hour = task.getFreqHour();
        if (hour == null) hour = 9;

        if ("once".equals(period)) {
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalDate baseDate = switch (period) {
            case "daily"  -> today;
            case "weekly" -> today.plusWeeks(1);
            case "monthly"-> today.plusMonths(1);
            default       -> today;       // 未知周期，默认每天
        };

        // 确保不是过去（如果今天还未到 freqHour，则仍是今天）
        if ("daily".equals(period)) {
            LocalDateTime candidate = LocalDateTime.of(today, LocalTime.of(hour, 0));
            if (!candidate.isBefore(LocalDateTime.now())) {
                baseDate = today;   // 今天还没过时间点
            } else {
                baseDate = today.plusDays(1);  // 已经过了，推到明天
            }
        }

        return LocalDateTime.of(baseDate, LocalTime.of(hour, 0));
    }

    /** 按 arxivId 精确查找 Specification。 */
    private Specification<Paper> arxivIdSpec(String arxivId) {
        return (root, query, cb) -> cb.equal(root.get("arxivId"), arxivId);
    }
}
