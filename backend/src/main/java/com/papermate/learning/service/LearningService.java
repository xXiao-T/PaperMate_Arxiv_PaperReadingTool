package com.papermate.learning.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.papermate.ai.service.LLMClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.papermate.learning.dto.KnowledgeGraphVO;
import com.papermate.learning.dto.LearningStatsVO;
import com.papermate.learning.entity.LearningStats;
import com.papermate.learning.repository.LearningStatsRepository;
import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.service.LibraryService;
import com.papermate.reader.repository.ReadingProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LearningService {
    private final LearningStatsRepository learningStatsRepository;
    private final LibraryService libraryService;
    private final LLMClient llmClient;
    private final ReadingProgressRepository progressRepo;

    public LearningService(
            LearningStatsRepository learningStatsRepository,
            LibraryService libraryService,
            LLMClient llmClient,
            ReadingProgressRepository progressRepo) {
        this.learningStatsRepository = learningStatsRepository;
        this.libraryService = libraryService;
        this.llmClient = llmClient;
        this.progressRepo = progressRepo;
    }

    @Transactional(readOnly = true)
    public LearningStatsVO getStats(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(
            TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)
        );
        LocalDate monthStart = today.withDayOfMonth(1);

        long weeklyMinutes = sumMinutes(
            learningStatsRepository.findByUserIdAndDateBetweenOrderByDateAsc(
                userId,
                weekStart,
                today
            )
        );
        long monthlyMinutes = sumMinutes(
            learningStatsRepository.findByUserIdAndDateBetweenOrderByDateAsc(
                userId,
                monthStart,
                today
            )
        );
        long totalMinutes = sumMinutes(
            learningStatsRepository.findByUserIdOrderByDateAsc(userId)
        );
        return new LearningStatsVO(weeklyMinutes, monthlyMinutes, totalMinutes);
    }

    @Transactional(readOnly = true)
    public List<LibraryPaperVO> getRecords(Long userId, String period) {
        return libraryService.getRecords(userId, period);
    }

    private static final Logger log = LoggerFactory.getLogger(LearningService.class);

    @Transactional(readOnly = true)
    public KnowledgeGraphVO generateKnowledgeGraph(Long userId, String period) {
        // 基于阅读时间筛选论文 ID
        LocalDateTime since = "monthly".equals(period)
            ? LocalDate.now().withDayOfMonth(1).atStartOfDay()
            : LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
        List<Long> paperIds = progressRepo.findByUserIdAndUpdatedAtAfter(userId, since)
            .stream().map(p -> p.getPaperId()).distinct().toList();
        if (paperIds.isEmpty()) return new KnowledgeGraphVO(List.of(), List.of());

        // 加载论文详情
        List<LibraryPaperVO> records = libraryService.getRecords(userId, "all").stream()
            .filter(r -> paperIds.contains(r.getId())).toList();
        log.info("KG: userId={}, period={}, records={}", userId, period, records.size());

        // 1) 尝试 AI 生成（基于标题+摘要+标签）
        String paperSummary = buildPaperSummary(records);
        try {
            String aiResult = llmClient.chat(
                "你是一个学术知识图谱生成器。根据用户提供的论文列表（含标题、标签、摘要），提取关键研究主题作为节点（id为英文标识，label为中文，desc为简短描述），并标注节点之间的关联（source→target，label为关联语义，weight为关联强度1-5）。输出纯JSON，格式严格为：{\"nodes\":[{\"id\":\"keyword\",\"label\":\"主题名\",\"desc\":\"描述(≤10字)\",\"value\":出现次数}],\"edges\":[{\"source\":\"A\",\"target\":\"B\",\"label\":\"关联语义\",\"value\":权重}]}",
                paperSummary
            );
            if (aiResult != null) {
                KnowledgeGraphVO aiVO = parseAIResult(aiResult);
                if (aiVO != null) return aiVO;
            }
        } catch (Exception ignored) {}

        // 2) AI 失败 → 统计降级（标签+标题关键词共现）
        return buildStatisticalGraph(records);
    }

    private KnowledgeGraphVO buildStatisticalGraph(List<LibraryPaperVO> records) {
        Map<String, Long> nodeCounts = new HashMap<>();
        Map<EdgeKey, Long> edgeCounts = new HashMap<>();

        for (LibraryPaperVO paper : records) {
            List<String> terms = extractTerms(paper);
            terms.forEach(t -> nodeCounts.merge(t, 1L, Long::sum));
            for (int i = 0; i < terms.size(); i++) {
                for (int j = i + 1; j < terms.size(); j++) {
                    String a = terms.get(i), b = terms.get(j);
                    if (a.compareTo(b) > 0) { String tmp = a; a = b; b = tmp; }
                    edgeCounts.merge(new EdgeKey(a, b), 1L, Long::sum);
                }
            }
        }

        List<KnowledgeGraphVO.Node> nodes = nodeCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .map(e -> new KnowledgeGraphVO.Node(e.getKey(), e.getKey(), e.getValue()))
            .limit(20)
            .toList();

        List<KnowledgeGraphVO.Edge> edges = edgeCounts.entrySet().stream()
            .filter(e -> e.getValue() >= 2)
            .sorted(Comparator.<Map.Entry<EdgeKey, Long>>comparingLong(Map.Entry::getValue).reversed())
            .map(e -> new KnowledgeGraphVO.Edge(e.getKey().source(), e.getKey().target(), e.getValue()))
            .limit(30)
            .toList();

        return new KnowledgeGraphVO(nodes, edges);
    }

    /** 从论文标题和标签中提取关键词 */
    private List<String> extractTerms(LibraryPaperVO paper) {
        List<String> terms = new ArrayList<>(normalizeTags(paper.getTags()));
        String title = paper.getTitle();
        if (title != null) {
            // 中英文混合分词
            for (String word : title.split("[\\s,，;；:：\\-()（）\\[\\]【】/\\\\|.]+")) {
                String w = word.trim();
                if (w.isEmpty()) continue;
                // 中文词（长度≥2）直接加入
                if (w.matches(".*[\\u4e00-\\u9fff].*")) {
                    if (w.length() >= 2) terms.add(w);
                } else {
                    // 英文词
                    String low = w.toLowerCase();
                    if (low.length() >= 3 && !isStopWord(low)) terms.add(low);
                }
            }
        }
        return terms.stream().distinct().sorted().toList();
    }

    private boolean isStopWord(String w) {
        return w.matches("^(the|and|for|via|its|with|from|based|using|into|over|new|can|has|are|was|not|but|all|this|that|have|been|will|each|some|also|than|which|about|paper|model|learning|method|approach|data|study|towards|large|language|vision|deep|neural|network)$");
    }

    private String buildPaperSummary(List<LibraryPaperVO> records) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        for (LibraryPaperVO p : records) {
            sb.append("[").append(++i).append("] ");
            sb.append("标题:").append(p.getTitle()).append("\n");
            List<String> tags = normalizeTags(p.getTags());
            if (!tags.isEmpty()) sb.append("标签:").append(String.join(",", tags)).append("\n");
            String ab = p.getPaperAbstract();
            if (ab != null && !ab.isBlank()) {
                if (ab.length() > 200) ab = ab.substring(0, 200) + "...";
                sb.append("摘要:").append(ab).append("\n");
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    private KnowledgeGraphVO parseAIResult(String json) {
        try {
            JsonNode root = new ObjectMapper().readTree(
                json.replaceAll("(?s)^```(?:json)?\\s*|```\\s*$", "").trim()
            );
            List<KnowledgeGraphVO.Node> nodes = new ArrayList<>();
            List<KnowledgeGraphVO.Edge> edges = new ArrayList<>();
            if (root.has("nodes")) {
                for (JsonNode n : root.get("nodes")) {
                    nodes.add(new KnowledgeGraphVO.Node(
                        n.path("id").asText(n.path("label").asText("")),
                        n.path("label").asText(n.path("id").asText("")),
                        n.path("desc").asText(""),
                        n.path("value").asLong(0)
                    ));
                }
            }
            if (root.has("edges")) {
                for (JsonNode e : root.get("edges")) {
                    edges.add(new KnowledgeGraphVO.Edge(
                        e.path("source").asText(""),
                        e.path("target").asText(""),
                        e.path("label").asText(""),
                        e.path("value").asLong(1)
                    ));
                }
            }
            if (nodes.isEmpty()) return null;
            return new KnowledgeGraphVO(nodes, edges);
        } catch (Exception e) {
            return null;
        }
    }

    private static long sumMinutes(List<LearningStats> stats) {
        return stats.stream()
            .map(LearningStats::getReadingMinutes)
            .filter(minutes -> minutes != null)
            .mapToLong(Long::longValue)
            .sum();
    }

    private static List<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(String::trim)
            .distinct()
            .sorted()
            .toList();
    }

    private record EdgeKey(String source, String target) {
    }
}
