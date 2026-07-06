package com.example.papermate.dto;

public class QARequestDTO {
    
    private Long paperId;
    private String question;
    
    public QARequestDTO() {}
    
    public QARequestDTO(Long paperId, String question) {
        this.paperId = paperId;
        this.question = question;
    }
    
    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }
    
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}