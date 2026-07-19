package com.papermate.paper.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "papers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "arxiv_id", unique = true, length = 64)
    private String arxivId;

    @Builder.Default
    @Column(name = "source", nullable = false, length = 32)
    private String source = "manual";

    @Column(name = "source_id", unique = true, length = 128)
    private String sourceId;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "authors", nullable = false, columnDefinition = "TEXT")
    private String authors;

    @Column(name = "paper_abstract", columnDefinition = "TEXT")
    private String paperAbstract;

    @Column(name = "category", length = 128)
    private String category;

    @Column(name = "published_at")
    private LocalDate publishedAt;

    @Column(name = "arxiv_url", columnDefinition = "TEXT")
    private String arxivUrl;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "pdf_path", length = 255)
    private String pdfPath;

    @Builder.Default
    @Column(name = "citation_count", nullable = false)
    private Integer citationCount = 0;

    @Builder.Default
    @Column(name = "parse_status", nullable = false, length = 32)
    private String parseStatus = "IMPORTED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (source == null || source.isBlank()) {
            source = "manual";
        }
        if (parseStatus == null || parseStatus.isBlank()) {
            parseStatus = "IMPORTED";
        }
        if (citationCount == null) {
            citationCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
