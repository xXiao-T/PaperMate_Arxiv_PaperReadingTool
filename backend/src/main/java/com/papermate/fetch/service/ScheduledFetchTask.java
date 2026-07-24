package com.papermate.fetch.service;

import com.papermate.fetch.entity.FetchTask;
import com.papermate.fetch.repository.FetchTaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时抓取调度器 —— 每 10 分钟扫描到达执行时间的 active 任务并执行。
 *
 * <p>设计依据：{@code backend/backend实现指南.md} §3.9 "定时调度: ScheduledFetchTask.java
 * 每 10 分钟检查 active 任务，到达时间后调用 ArxivClient 抓取 → 调 PaperService 入库"。</p>
 *
 * <p>调度开关由 {@link com.papermate.config.SchedulingConfig} 的
 * {@code @EnableScheduling} 控制。</p>
 */
@Component
public class ScheduledFetchTask {

    private static final Logger log = LoggerFactory.getLogger(ScheduledFetchTask.class);

    private final FetchTaskRepository taskRepo;
    private final FetchService fetchService;

    public ScheduledFetchTask(FetchTaskRepository taskRepo, FetchService fetchService) {
        this.taskRepo = taskRepo;
        this.fetchService = fetchService;
    }

    /**
     * 核心调度方法，每 10 分钟执行一次。
     *
     * <p>流程：</p>
     * <ol>
     *   <li>查所有 status=active 且 nextRunAt 已到达的任务</li>
     *   <li>逐条调用 {@link FetchService#executeFetch(FetchTask)}</li>
     *   <li>executeFetch 内部完成 Arxiv 查询、去重入库、状态更新</li>
     * </ol>
     */
    @Scheduled(fixedRate = 600_000)   // 10 分钟 = 600,000 ms
    public void run() {
        log.debug("Scheduled fetch scan started");

        List<FetchTask> dueTasks = taskRepo.findByStatusAndNextRunAtBefore("active", LocalDateTime.now());

        if (dueTasks.isEmpty()) {
            log.debug("No due fetch tasks");
            return;
        }

        log.info("Found {} due fetch task(s)", dueTasks.size());

        for (FetchTask task : dueTasks) {
            try {
                fetchService.executeFetch(task);
            } catch (Exception e) {
                log.error("Fetch task execution failed: id={}, name=\"{}\": {}",
                        task.getId(), task.getName(), e.getMessage(), e);
                // 单任务异常不中断其他任务的执行
            }
        }

        log.debug("Scheduled fetch scan completed");
    }
}
