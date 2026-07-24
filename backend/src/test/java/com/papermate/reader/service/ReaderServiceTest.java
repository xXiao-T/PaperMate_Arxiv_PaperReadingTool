package com.papermate.reader.service;

import com.papermate.common.utils.SecurityUtil;
import com.papermate.paper.service.PaperService;
import com.papermate.reader.dto.ProgressDTO;
import com.papermate.reader.entity.ReadingProgress;
import com.papermate.reader.repository.ReadingProgressRepository;
import com.papermate.reader.service.impl.ReaderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReaderServiceTest {
    @Mock
    private ReadingProgressRepository progressRepository;

    @Mock
    private PaperService paperService;

    @Mock
    private SecurityUtil securityUtil;

    private ReaderService readerService;

    @BeforeEach
    void setUp() {
        readerService = new ReaderServiceImpl(
            progressRepository,
            paperService,
            securityUtil
        );
    }

    @Test
    void saveProgressComputesPercentageAndCompletion() {
        when(securityUtil.getCurrentUserId()).thenReturn(7L);
        when(progressRepository.findByUserIdAndPaperId(7L, 9L))
            .thenReturn(Optional.empty());
        when(progressRepository.save(any(ReadingProgress.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ProgressDTO halfway = readerService.saveProgress(9L, 5, 10);
        ProgressDTO completed = readerService.saveProgress(9L, 10, 10);

        assertEquals(50.0, halfway.getProgressPercentage());
        assertFalse(halfway.getCompleted());
        assertEquals(100.0, completed.getProgressPercentage());
        assertTrue(completed.getCompleted());
        verify(paperService, times(2)).requireExists(9L);
    }

    @Test
    void saveProgressRejectsCurrentPageAfterLastPage() {
        assertThrows(
            IllegalArgumentException.class,
            () -> readerService.saveProgress(9L, 11, 10)
        );
        verify(paperService, never()).requireExists(any());
    }
}
