package com.papermate.note.dto;

import com.papermate.note.entity.Annotation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AnnotationDTO {
    private final Long id;
    private final Long paperId;
    private final Integer pageIndex;
    private final Integer startOffset;
    private final Integer endOffset;
    private final Double pdfX;
    private final Double pdfY;
    private final Double pdfWidth;
    private final Double pdfHeight;
    private final String selectedText;
    private final String commentText;
    private final String annotationType;
    private final String color;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static AnnotationDTO fromEntity(Annotation annotation) {
        return AnnotationDTO.builder()
            .id(annotation.getId())
            .paperId(annotation.getPaperId())
            .pageIndex(annotation.getPageIndex())
            .startOffset(annotation.getStartOffset())
            .endOffset(annotation.getEndOffset())
            .pdfX(annotation.getPdfX())
            .pdfY(annotation.getPdfY())
            .pdfWidth(annotation.getPdfWidth())
            .pdfHeight(annotation.getPdfHeight())
            .selectedText(annotation.getSelectedText())
            .commentText(annotation.getCommentText())
            .annotationType(annotation.getAnnotationType())
            .color(annotation.getColor())
            .createdAt(annotation.getCreatedAt())
            .updatedAt(annotation.getUpdatedAt())
            .build();
    }
}
