package com.papermate.note.entity;

import com.papermate.auth.entity.User;
import com.papermate.paper.entity.Paper;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "paper_annotations")
public class Annotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @Column(name = "page_index", nullable = false)
    private Integer pageIndex;

    @Column(name = "start_offset", nullable = false)
    private Integer startOffset;

    @Column(name = "end_offset", nullable = false)
    private Integer endOffset;

    @Column(name = "selected_text", columnDefinition = "TEXT")
    private String selectedText;

    @Column(name = "comment_text", columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "annotation_type", length = 20)
    private String annotationType;

    @Column(length = 20)
    private String color;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ─── 构造器 ──────────────────────────────────────────────────────────

    public Annotation() {}

    public Annotation(Long id, User user, Paper paper, Integer pageIndex, Integer startOffset,
                      Integer endOffset, String selectedText, String commentText,
                      String annotationType, String color, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.paper = paper;
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

    // ─── Getters ────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public User getUser() { return user; }

    public Paper getPaper() { return paper; }

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

    public void setUser(User user) { this.user = user; }

    public void setPaper(Paper paper) { this.paper = paper; }

    public void setPageIndex(Integer pageIndex) { this.pageIndex = pageIndex; }

    public void setStartOffset(Integer startOffset) { this.startOffset = startOffset; }

    public void setEndOffset(Integer endOffset) { this.endOffset = endOffset; }

    public void setSelectedText(String selectedText) { this.selectedText = selectedText; }

    public void setCommentText(String commentText) { this.commentText = commentText; }

    public void setAnnotationType(String annotationType) { this.annotationType = annotationType; }

    public void setColor(String color) { this.color = color; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ─── Builder ────────────────────────────────────────────────────────

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Paper paper;
        private Integer pageIndex;
        private Integer startOffset;
        private Integer endOffset;
        private String selectedText;
        private String commentText;
        private String annotationType;
        private String color;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }

        public Builder user(User user) { this.user = user; return this; }

        public Builder paper(Paper paper) { this.paper = paper; return this; }

        public Builder pageIndex(Integer pageIndex) { this.pageIndex = pageIndex; return this; }

        public Builder startOffset(Integer startOffset) { this.startOffset = startOffset; return this; }

        public Builder endOffset(Integer endOffset) { this.endOffset = endOffset; return this; }

        public Builder selectedText(String selectedText) { this.selectedText = selectedText; return this; }

        public Builder commentText(String commentText) { this.commentText = commentText; return this; }

        public Builder annotationType(String annotationType) { this.annotationType = annotationType; return this; }

        public Builder color(String color) { this.color = color; return this; }

        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Annotation build() {
            return new Annotation(id, user, paper, pageIndex, startOffset, endOffset,
                    selectedText, commentText, annotationType, color, createdAt, updatedAt);
        }
    }
}