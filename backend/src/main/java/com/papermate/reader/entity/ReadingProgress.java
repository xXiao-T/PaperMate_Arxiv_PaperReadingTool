package com.papermate.reader.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress")
public class ReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "paper_id", nullable = false)
    private Long paperId;

    @Column(name = "current_page", nullable = false)
    private Integer currentPage = 0;

    @Column(name = "total_pages", nullable = false)
    private Integer totalPages = 0;

    @Column(name = "progress_percentage", nullable = false)
    private Double progressPercentage = 0.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ─── 构造器 ──────────────────────────────────────────────────────────

    public ReadingProgress() {}

    public ReadingProgress(Long id, Long userId, Long paperId, Integer currentPage,
                           Integer totalPages, Double progressPercentage, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.paperId = paperId;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.progressPercentage = progressPercentage;
        this.updatedAt = updatedAt;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getUserId() { return userId; }

    public Long getPaperId() { return paperId; }

    public Integer getCurrentPage() { return currentPage; }

    public Integer getTotalPages() { return totalPages; }

    public Double getProgressPercentage() { return progressPercentage; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ─── Setters ────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }

    public void setUserId(Long userId) { this.userId = userId; }

    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }

    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }

    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}