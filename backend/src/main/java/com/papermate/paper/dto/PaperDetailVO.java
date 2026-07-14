package com.papermate.paper.dto;

import com.papermate.paper.entity.Paper;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class PaperDetailVO {
    private Long id;
    private String title;
    private String authors;
    private String paperAbstract;
    private String category;
    private LocalDate publishedAt;
    private String arxivUrl;
    private List<String> tags;
    private String pdfPath;
    private LocalDate createdAt;
    private Boolean favorited;
    private Boolean starred;

    public static PaperDetailVO fromEntity(Paper paper, Boolean favorited, Boolean starred) {
        PaperDetailVO vo = new PaperDetailVO();
        vo.setId(paper.getId());
        vo.setTitle(paper.getTitle());
        vo.setAuthors(paper.getAuthors());
        vo.setPaperAbstract(paper.getPaperAbstract());
        vo.setCategory(paper.getCategory());
        vo.setPublishedAt(paper.getPublishedAt());
        vo.setArxivUrl(paper.getArxivUrl());
        vo.setTags(paper.getTags() != null
            ? Arrays.asList(paper.getTags().split("\\s*,\\s*"))
            : Collections.emptyList());
        vo.setPdfPath(paper.getPdfPath());
        vo.setCreatedAt(paper.getCreatedAt() != null ? paper.getCreatedAt().toLocalDate() : null);
        vo.setFavorited(favorited);
        vo.setStarred(starred);
        return vo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public Boolean getFavorited() { return favorited; }
    public void setFavorited(Boolean favorited) { this.favorited = favorited; }
    public Boolean getStarred() { return starred; }
    public void setStarred(Boolean starred) { this.starred = starred; }
}
