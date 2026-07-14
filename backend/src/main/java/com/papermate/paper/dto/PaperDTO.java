package com.papermate.paper.dto;

import com.papermate.paper.entity.Paper;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class PaperDTO {
    private Long id;
    private String title;
    private String authors;
    private LocalDate publishedAt;
    private List<String> tags;
    private String paperAbstract;
    private String arxivUrl;
    private Boolean favorited;
    private Boolean starred;

    public static PaperDTO fromEntity(Paper paper, Boolean favorited, Boolean starred) {
        PaperDTO dto = new PaperDTO();
        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setAuthors(paper.getAuthors());
        dto.setPublishedAt(paper.getPublishedAt());
        dto.setTags(paper.getTags() != null
            ? Arrays.asList(paper.getTags().split("\\s*,\\s*"))
            : Collections.emptyList());
        dto.setPaperAbstract(paper.getPaperAbstract());
        dto.setArxivUrl(paper.getArxivUrl());
        dto.setFavorited(favorited);
        dto.setStarred(starred);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }
    public LocalDate getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDate publishedAt) { this.publishedAt = publishedAt; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getPaperAbstract() { return paperAbstract; }
    public void setPaperAbstract(String paperAbstract) { this.paperAbstract = paperAbstract; }
    public String getArxivUrl() { return arxivUrl; }
    public void setArxivUrl(String arxivUrl) { this.arxivUrl = arxivUrl; }
    public Boolean getFavorited() { return favorited; }
    public void setFavorited(Boolean favorited) { this.favorited = favorited; }
    public Boolean getStarred() { return starred; }
    public void setStarred(Boolean starred) { this.starred = starred; }
}
