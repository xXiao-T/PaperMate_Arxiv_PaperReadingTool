package com.papermate.reader.service.impl;

import com.papermate.auth.entity.User;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.reader.dto.ProgressDTO;
import com.papermate.reader.entity.ReadingProgress;
import com.papermate.reader.repository.ReadingProgressRepository;
import com.papermate.reader.service.ReaderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReaderServiceImpl implements ReaderService {

    private final ReadingProgressRepository progressRepository;
    private final SecurityUtil securityUtil;

    // 手动构造器
    public ReaderServiceImpl(ReadingProgressRepository progressRepository, SecurityUtil securityUtil) {
        this.progressRepository = progressRepository;
        this.securityUtil = securityUtil;
    }

    @Override
    public ProgressDTO getProgress(Long paperId) {
        User currentUser = securityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalArgumentException("用户未登录"));

        return progressRepository
                .findByUserIdAndPaperId(currentUser.getId(), paperId)
                .map(ProgressDTO::fromEntity)
                .orElse(null);
    }

    @Override
    @Transactional
    public ProgressDTO saveProgress(Long paperId, Integer currentPage, Integer totalPages) {
        User currentUser = securityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalArgumentException("用户未登录"));

        ReadingProgress progress = progressRepository
                .findByUserIdAndPaperId(currentUser.getId(), paperId)
                .orElse(new ReadingProgress());

        progress.setUserId(currentUser.getId());
        progress.setPaperId(paperId);
        progress.setCurrentPage(currentPage);
        progress.setTotalPages(totalPages);
        progress.setProgressPercentage(totalPages > 0 ? (currentPage * 100.0 / totalPages) : 0.0);

        ReadingProgress saved = progressRepository.save(progress);
        return ProgressDTO.fromEntity(saved);
    }
}