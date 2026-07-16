package com.papermate.note.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AnnotationRequest {

    @NotNull(message = "页码不能为空")
    @Min(value = 0, message = "页码必须 >= 0")
    private Integer pageIndex;

    @NotNull(message = "起始偏移不能为空")
    @Min(value = 0, message = "起始偏移必须 >= 0")
    private Integer startOffset;

    @NotNull(message = "结束偏移不能为空")
    @Min(value = 0, message = "结束偏移必须 >= 0")
    private Integer endOffset;

    @NotBlank(message = "选中原文不能为空")
    private String selectedText;

    private String commentText;

    private String annotationType;

    private String color;

    // Getters and Setters
    public Integer getPageIndex() { return pageIndex; }
    public void setPageIndex(Integer pageIndex) { this.pageIndex = pageIndex; }
    public Integer getStartOffset() { return startOffset; }
    public void setStartOffset(Integer startOffset) { this.startOffset = startOffset; }
    public Integer getEndOffset() { return endOffset; }
    public void setEndOffset(Integer endOffset) { this.endOffset = endOffset; }
    public String getSelectedText() { return selectedText; }
    public void setSelectedText(String selectedText) { this.selectedText = selectedText; }
    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
    public String getAnnotationType() { return annotationType; }
    public void setAnnotationType(String annotationType) { this.annotationType = annotationType; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}