package com.papermate.learning.service;

import com.papermate.learning.dto.KnowledgeGraphVO;
import com.papermate.learning.dto.LearningStatsVO;
import com.papermate.learning.entity.LearningStats;
import com.papermate.learning.repository.LearningStatsRepository;
import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.service.LibraryService;
import com.papermate.ai.service.LLMClient;
import com.papermate.reader.entity.ReadingProgress;
import com.papermate.reader.repository.ReadingProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LearningServiceTest {
    @Mock
    private LearningStatsRepository learningStatsRepository;

    @Mock
    private LibraryService libraryService;

    @Mock
    private LLMClient llmClient;

    @Mock
    private ReadingProgressRepository progressRepository;

    private LearningService learningService;

    @BeforeEach
    void setUp() {
        learningService = new LearningService(
            learningStatsRepository,
            libraryService,
            llmClient,
            progressRepository
        );
    }

    @Test
    void getStatsAggregatesWeeklyMonthlyAndTotalMinutes() {
        when(learningStatsRepository
            .findByUserIdAndDateBetweenOrderByDateAsc(eq(7L), any(), any()))
            .thenReturn(List.of(stats(30L)))
            .thenReturn(List.of(stats(30L), stats(45L)));
        when(learningStatsRepository.findByUserIdOrderByDateAsc(7L))
            .thenReturn(List.of(stats(30L), stats(45L), stats(60L)));

        LearningStatsVO result = learningService.getStats(7L);

        assertEquals(30L, result.getWeeklyReadingMinutes());
        assertEquals(75L, result.getMonthlyReadingMinutes());
        assertEquals(135L, result.getTotalReadingMinutes());
    }

    @Test
    void knowledgeGraphCountsDistinctTagsAndCooccurrences() {
        ReadingProgress progress = ReadingProgress.builder()
            .userId(7L).paperId(1L).build();
        when(progressRepository.findByUserIdAndUpdatedAtAfter(eq(7L), any(LocalDateTime.class)))
            .thenReturn(List.of(progress));
        when(libraryService.getRecords(7L, "all")).thenReturn(List.of(
            paper("NLP", "LLM"),
            paper("NLP", "LLM"),
            paper("LLM", "Transformer"),
            paper("LLM", "Transformer")
        ));

        KnowledgeGraphVO result = learningService.generateKnowledgeGraph(
            7L,
            "monthly"
        );

        assertEquals(3, result.getNodes().size());
        // 节点按出现次数降序：LLM 出现 4 次，应排第一
        assertEquals("LLM", result.getNodes().get(0).getId());
        assertEquals(4L, result.getNodes().get(0).getValue());
        // 共现边按 >=2 次过滤：NLP-LLM 与 LLM-Transformer 各 2 次
        assertEquals(2, result.getEdges().size());
    }

    private static LearningStats stats(long minutes) {
        return LearningStats.builder()
            .userId(7L)
            .date(LocalDate.now())
            .readingMinutes(minutes)
            .build();
    }

    private static LibraryPaperVO paper(String... tags) {
        return LibraryPaperVO.builder()
            .id(1L)
            .title("Paper")
            .tags(List.of(tags))
            .build();
    }
}
