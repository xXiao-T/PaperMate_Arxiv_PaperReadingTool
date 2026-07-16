package com.papermate.note.dto;

import com.papermate.note.entity.Annotation;
import java.time.LocalDateTime;

public class AnnotationDTO {

    private Long id;
    private Long paperId;
    private Integer pageIndex;
    private Integer startOffset;
    private Integer endOffset;
    private String selectedText;
    private String commentText;
    private String annotationType;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ─── 构造器 ──────────────────────────────────────────────────────────

    public AnnotationDTO() {}

    public AnnotationDTO(Long id, Long paperId, Integer pageIndex, Integer startOffset,
                         Integer endOffset, String selectedText, String commentText,
                         String annotationType, String color,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.paperId = paperId;
        this.pageIndex = pageIndex;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
        this.selectedText = selectedText;
        this.commentText = commentText;
        this.annotationType = annotationType;
        this.color = color;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── fromEntity 工厂方法 ────────────────────────────────────────────

    public static AnnotationDTO fromEntity(Annotation annotation) {
        AnnotationDTO dto = new AnnotationDTO();
        dto.setId(annotation.getId());
        dto.setPaperId(annotation.getPaper().getId());
        dto.setPageIndex(annotation.getPageIndex());
        dto.setStartOffset(annotation.getStartOffset());
        dto.setEndOffset(annotation.getEndOffset());
        dto.setSelectedText(annotation.getSelectedText());
        dto.setCommentText(annotation.getCommentText());
        dto.setAnnotationType(annotation.getAnnotationType());
        dto.setColor(annotation.getColor());
        dto.setCreatedAt(annotation.getCreatedAt());
        dto.setUpdatedAt(annotation.getUpdatedAt());
        return dto;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getPaperId() { return paperId; }

    public Integer getPageIndex() { return pageIndex; }

    public Integer getStartOffset() { return startOffset; }

    public Integer getEndOffset() { return endOffset; }

    public String getSelectedText() { return selectedText; }

    public String getCommentText() { return commentText; }

    public String getAnnotationType() { return annotationType; }

    public String getColor() { return color; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ─── Setters ────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }

    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public void setPageIndex(Integer pageIndex) { this.pageIndex = pageIndex; }

    public void setStartOffset(Integer startOffset) { this.startOffset = startOffset; }

    public void setEndOffset(Integer endOffset) { this.endOffset = endOffset; }

    public void setSelectedText(String selectedText) { this.selectedText = selectedText; }

    public void setCommentText(String commentText) { this.commentText = commentText; }

    public void setAnnotationType(String annotationType) { this.annotationType = annotationType; }

    public void setColor(String color) { this.color = color; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}