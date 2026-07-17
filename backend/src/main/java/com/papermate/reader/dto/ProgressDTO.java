package com.papermate.reader.dto;

import com.papermate.reader.entity.ReadingProgress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProgressDTO {
    private final Long id;
    private final Long paperId;
    private final Integer currentPage;
    private final Integer totalPages;
    private final Double progressPercentage;
    private final Boolean completed;

    public static ProgressDTO fromEntity(ReadingProgress progress) {
        return ProgressDTO.builder()
            .id(progress.getId())
            .paperId(progress.getPaperId())
            .currentPage(progress.getCurrentPage())
            .totalPages(progress.getTotalPages())
            .progressPercentage(progress.getProgressPercentage())
            .completed(Boolean.TRUE.equals(progress.getCompleted()))
            .build();
    }
}
