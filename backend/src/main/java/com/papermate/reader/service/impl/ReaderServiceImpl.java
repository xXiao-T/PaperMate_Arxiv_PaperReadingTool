package com.papermate.reader.service.impl;

import com.papermate.common.utils.SecurityUtil;
import com.papermate.paper.service.PaperService;
import java.time.LocalDate;
import com.papermate.reader.dto.ProgressDTO;
import com.papermate.reader.entity.ReadingProgress;
import com.papermate.reader.repository.ReadingProgressRepository;
import com.papermate.reader.service.ReaderService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReaderServiceImpl implements ReaderService {
    private final ReadingProgressRepository progressRepository;
    private final PaperService paperService;
    private final SecurityUtil securityUtil;
    private final com.papermate.learning.repository.LearningStatsRepository statsRepo;

    public ReaderServiceImpl(
            ReadingProgressRepository progressRepository,
            PaperService paperService,
            SecurityUtil securityUtil,
            com.papermate.learning.repository.LearningStatsRepository statsRepo) {
        this.progressRepository = progressRepository;
        this.paperService = paperService;
        this.securityUtil = securityUtil;
        this.statsRepo = statsRepo;
    }

    @Override
    @Transactional(readOnly = true)
    public ProgressDTO getProgress(Long paperId) {
        paperService.requireExists(paperId);
        return progressRepository.findByUserIdAndPaperId(currentUserId(), paperId)
            .map(ProgressDTO::fromEntity)
            .orElse(null);
    }

    @Override
    @Transactional
    public ProgressDTO saveProgress(
            Long paperId,
            Integer currentPage,
            Integer totalPages,
            Integer readingMinutes) {
        validateProgress(currentPage, totalPages);
        paperService.requireExists(paperId);
        Long userId = currentUserId();
        ReadingProgress progress = progressRepository
            .findByUserIdAndPaperId(userId, paperId)
            .orElseGet(() -> ReadingProgress.builder()
                .userId(userId)
                .paperId(paperId)
                .build());

        double percentage = totalPages == 0
            ? 0.0
            : Math.min(100.0, currentPage * 100.0 / totalPages);
        progress.setCurrentPage(currentPage);
        progress.setTotalPages(totalPages);
        progress.setProgressPercentage(percentage);
        progress.setCompleted(totalPages > 0 && currentPage >= totalPages);
        ReadingProgress saved = progressRepository.save(progress);

        // 记录真实阅读时长
        if (readingMinutes != null && readingMinutes > 0) {
            recordReadingStats(userId, readingMinutes);
        }

        return ProgressDTO.fromEntity(saved);
    }

    private Long currentUserId() {
        try {
            return securityUtil.getCurrentUserId();
        } catch (IllegalStateException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                "User is not authenticated"
            );
        }
    }

    private void recordReadingStats(Long userId, int minutes) {
        com.papermate.learning.entity.LearningStats stats = statsRepo
            .findByUserIdAndDate(userId, java.time.LocalDate.now())
            .orElseGet(() -> com.papermate.learning.entity.LearningStats.builder()
                .userId(userId).date(java.time.LocalDate.now()).readCount(0)
                .deepReadCount(0).readingMinutes(0L).build());
        stats.setReadCount((stats.getReadCount() != null ? stats.getReadCount() : 0) + 1);
        stats.setReadingMinutes((stats.getReadingMinutes() != null ? stats.getReadingMinutes() : 0L) + Math.max(1, minutes));
        statsRepo.save(stats);
    }

    private static void validateProgress(Integer currentPage, Integer totalPages) {
        if (currentPage == null || totalPages == null) {
            throw new IllegalArgumentException(
                "Current page and total pages are required"
            );
        }
        if (currentPage < 0 || totalPages < 0) {
            throw new IllegalArgumentException("Page values must not be negative");
        }
        if (totalPages > 0 && currentPage > totalPages) {
            throw new IllegalArgumentException(
                "Current page must not exceed total pages"
            );
        }
    }
}
