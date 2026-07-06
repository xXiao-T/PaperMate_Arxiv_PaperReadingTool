package com.example.papermate.dto;

import java.time.LocalDate;

public class UserNoteDTO {
    
    private Long id;
    private String content;
    private String noteType;
    private Long paperId;
    private Long userId;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    
    public UserNoteDTO() {}
    
    public UserNoteDTO(Long id, String content, String noteType, Long paperId, 
                       Long userId, LocalDate createdAt, LocalDate updatedAt) {
        this.id = id;
        this.content = content;
        this.noteType = noteType;
        this.paperId = paperId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    
    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    
    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
}