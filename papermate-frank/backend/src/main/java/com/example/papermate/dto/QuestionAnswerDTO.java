package com.example.papermate.dto;

import java.time.LocalDate;

public class QuestionAnswerDTO {
    
    private Long id;
    private String question;
    private String answer;
    private Long paperId;
    private LocalDate createdAt;
    
    public QuestionAnswerDTO() {}
    
    public QuestionAnswerDTO(Long id, String question, String answer, Long paperId, LocalDate createdAt) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.paperId = paperId;
        this.createdAt = createdAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    
    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }
    
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}