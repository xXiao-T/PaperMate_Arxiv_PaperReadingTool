package com.papermate.reader.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "reading_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "paper_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "paper_id", nullable = false)
    private Long paperId;

    @Builder.Default
    @Column(name = "current_page", nullable = false)
    private Integer currentPage = 0;

    @Builder.Default
    @Column(name = "total_pages", nullable = false)
    private Integer totalPages = 0;

    @Builder.Default
    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    @Builder.Default
    @Column(name = "progress_percentage", nullable = false)
    private Double progressPercentage = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        applyDefaults();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        applyDefaults();
    }

    private void applyDefaults() {
        if (currentPage == null) {
            currentPage = 0;
        }
        if (totalPages == null) {
            totalPages = 0;
        }
        if (completed == null) {
            completed = false;
        }
        if (progressPercentage == null) {
            progressPercentage = 0.0;
        }
    }
}
