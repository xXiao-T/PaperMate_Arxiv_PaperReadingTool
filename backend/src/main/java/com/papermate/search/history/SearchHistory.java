package com.papermate.search.history;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "search_history")
public class SearchHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false, length = 512) private String query;
    @Column(length = 16) private String searchType;
    @Column(updatable = false) private LocalDateTime createdAt;
    public SearchHistory() {}
    public SearchHistory(Long userId, String query, String searchType) { this.userId = userId; this.query = query; this.searchType = searchType; }
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long userId) { this.userId = userId; }
    public String getQuery() { return query; } public void setQuery(String query) { this.query = query; }
    public String getSearchType() { return searchType; } public void setSearchType(String searchType) { this.searchType = searchType; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}