package com.papermate.paper.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class PaperImportRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Authors is required")
    private String authors;

    private String paperAbstract;
    private String category;
    private LocalDate publishedAt;
    private String arxivUrl;
    private String tags;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }
    public String getPaperAbstract() { return paperAbstract; }
    public void setPaperAbstract(String paperAbstract) { this.paperAbstract = paperAbstract; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDate getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDate publishedAt) { this.publishedAt = publishedAt; }
    public String getArxivUrl() { return arxivUrl; }
    public void setArxivUrl(String arxivUrl) { this.arxivUrl = arxivUrl; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
