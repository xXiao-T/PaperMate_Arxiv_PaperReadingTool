package com.example.papermate.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "question_answers")
public class QuestionAnswer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 2000)
    private String question;
    
    @Column(nullable = false, length = 5000)
    private String answer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id")
    private Paper paper;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }
    
    public QuestionAnswer() {}
    
    public QuestionAnswer(Long id, String question, String answer, Paper paper, LocalDate createdAt) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.paper = paper;
        this.createdAt = createdAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    
    public Paper getPaper() { return paper; }
    public void setPaper(Paper paper) { this.paper = paper; }
    
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}