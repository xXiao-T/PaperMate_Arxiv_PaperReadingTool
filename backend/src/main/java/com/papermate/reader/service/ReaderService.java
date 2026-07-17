package com.papermate.reader.service;

import com.papermate.reader.dto.ProgressDTO;

public interface ReaderService {
    ProgressDTO getProgress(Long paperId);

    ProgressDTO saveProgress(Long paperId, Integer currentPage, Integer totalPages);
}
