package com.example.papermate.dto;

import java.time.LocalDate;

public class SearchRequestDTO {
    
    private String keyword;
    private String category;
    private String author;
    private LocalDate startDate;
    private LocalDate endDate;
    
    public SearchRequestDTO() {}
    
    public SearchRequestDTO(String keyword, String category, String author, 
                           LocalDate startDate, LocalDate endDate) {
        this.keyword = keyword;
        this.category = category;
        this.author = author;
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}