package com.papermate.learning.service;

import com.papermate.learning.dto.KnowledgeGraphVO;
import com.papermate.learning.dto.LearningStatsVO;
import com.papermate.learning.entity.LearningStats;
import com.papermate.learning.repository.LearningStatsRepository;
import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.service.LibraryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LearningService {
    private final LearningStatsRepository learningStatsRepository;
    private final LibraryService libraryService;

    public LearningService(
            LearningStatsRepository learningStatsRepository,
            LibraryService libraryService) {
        this.learningStatsRepository = learningStatsRepository;
        this.libraryService = libraryService;
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

    @Transactional(readOnly = true)
    public KnowledgeGraphVO generateKnowledgeGraph(Long userId, String period) {
        List<LibraryPaperVO> records = libraryService.getRecords(userId, period);
        Map<String, Long> nodeCounts = new HashMap<>();
        Map<EdgeKey, Long> edgeCounts = new HashMap<>();

        for (LibraryPaperVO paper : records) {
            List<String> tags = normalizeTags(paper.getTags());
            tags.forEach(tag -> nodeCounts.merge(tag, 1L, Long::sum));
            for (int left = 0; left < tags.size(); left++) {
                for (int right = left + 1; right < tags.size(); right++) {
                    edgeCounts.merge(
                        new EdgeKey(tags.get(left), tags.get(right)),
                        1L,
                        Long::sum
                    );
                }
            }
        }

        List<KnowledgeGraphVO.Node> nodes = nodeCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()))
            .map(entry -> new KnowledgeGraphVO.Node(
                entry.getKey(),
                entry.getKey(),
                entry.getValue()
            ))
            .toList();

        List<KnowledgeGraphVO.Edge> edges = edgeCounts.entrySet().stream()
            .sorted(Comparator
                .comparing((Map.Entry<EdgeKey, Long> entry) -> entry.getKey().source())
                .thenComparing(entry -> entry.getKey().target()))
            .map(entry -> new KnowledgeGraphVO.Edge(
                entry.getKey().source(),
                entry.getKey().target(),
                entry.getValue()
            ))
            .toList();
        return new KnowledgeGraphVO(nodes, edges);
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
