package com.papermate.learning.service;

import com.papermate.learning.dto.KnowledgeGraphVO;
import com.papermate.learning.dto.LearningStatsVO;
import com.papermate.learning.entity.LearningStats;
import com.papermate.learning.repository.LearningStatsRepository;
import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.service.LibraryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
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

    private LearningService learningService;

    @BeforeEach
    void setUp() {
        learningService = new LearningService(
            learningStatsRepository,
            libraryService
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
        when(libraryService.getRecords(7L, "month")).thenReturn(List.of(
            paper("NLP", "Transformer", "NLP"),
            paper("NLP", "LLM")
        ));

        KnowledgeGraphVO result = learningService.generateKnowledgeGraph(
            7L,
            "month"
        );

        assertEquals(3, result.getNodes().size());
        assertEquals("NLP", result.getNodes().get(0).getId());
        assertEquals(2L, result.getNodes().get(0).getValue());
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
