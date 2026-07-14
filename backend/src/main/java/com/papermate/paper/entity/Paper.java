package com.papermate.paper.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Paper entity — core model shared by all modules.
 */
@Entity
@Table(name = "papers")
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 64)
    private String arxivId;

    @Column(length = 32)
    private String source = "manual";

    @Column(length = 128, unique = true)
    private String sourceId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String paperAbstract;

    @Column(length = 64)
    private String category;

    @Column(length = 512)
    private String authors;

    private LocalDate publishedAt;

    @Column(length = 512)
    private String arxivUrl;

    @Column(length = 512)
    private String pdfPath;

    @Column(length = 512)
    private String tags;

    private Integer citationCount = 0;

    @Column(length = 32)
    private String parseStatus = "IMPORTED";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Paper() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (source == null) source = "manual";
        if (parseStatus == null) parseStatus = "IMPORTED";
        if (citationCount == null) citationCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ─── Getters / Setters ─────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getArxivId() { return arxivId; }
    public void setArxivId(String arxivId) { this.arxivId = arxivId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPaperAbstract() { return paperAbstract; }
    public void setPaperAbstract(String paperAbstract) { this.paperAbstract = paperAbstract; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public LocalDate getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDate publishedAt) { this.publishedAt = publishedAt; }

    public String getArxivUrl() { return arxivUrl; }
    public void setArxivUrl(String arxivUrl) { this.arxivUrl = arxivUrl; }

    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }

    public String getParseStatus() { return parseStatus; }
    public void setParseStatus(String parseStatus) { this.parseStatus = parseStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ─── Builder ───────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String arxivId;
        private String source = "manual";
        private String sourceId;
        private String title;
        private String paperAbstract;
        private String category;
        private String authors;
        private LocalDate publishedAt;
        private String arxivUrl;
        private String pdfPath;
        private String tags;
        private Integer citationCount = 0;
        private String parseStatus = "IMPORTED";
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder arxivId(String val) { this.arxivId = val; return this; }
        public Builder source(String val) { this.source = val; return this; }
        public Builder sourceId(String val) { this.sourceId = val; return this; }
        public Builder title(String val) { this.title = val; return this; }
        public Builder paperAbstract(String val) { this.paperAbstract = val; return this; }
        public Builder category(String val) { this.category = val; return this; }
        public Builder authors(String val) { this.authors = val; return this; }
        public Builder publishedAt(LocalDate val) { this.publishedAt = val; return this; }
        public Builder arxivUrl(String val) { this.arxivUrl = val; return this; }
        public Builder pdfPath(String val) { this.pdfPath = val; return this; }
        public Builder tags(String val) { this.tags = val; return this; }
        public Builder citationCount(Integer val) { this.citationCount = val; return this; }
        public Builder parseStatus(String val) { this.parseStatus = val; return this; }
        public Builder createdAt(LocalDateTime val) { this.createdAt = val; return this; }
        public Builder updatedAt(LocalDateTime val) { this.updatedAt = val; return this; }

        public Paper build() {
            Paper p = new Paper();
            p.id = id;
            p.arxivId = arxivId;
            p.source = source;
            p.sourceId = sourceId;
            p.title = title;
            p.paperAbstract = paperAbstract;
            p.category = category;
            p.authors = authors;
            p.publishedAt = publishedAt;
            p.arxivUrl = arxivUrl;
            p.pdfPath = pdfPath;
            p.tags = tags;
            p.citationCount = citationCount;
            p.parseStatus = parseStatus;
            p.createdAt = createdAt;
            p.updatedAt = updatedAt;
            return p;
        }
    }
}
