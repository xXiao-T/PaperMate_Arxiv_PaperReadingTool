package com.example.papermate.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "concepts")
public class Concept {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 2000)
    private String definition;
    
    @Column(name = "related_concepts")
    private String relatedConcepts;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id")
    private Paper paper;
    
    @Column(name = "importance_score")
    private Double importanceScore;
    
    public Concept() {}
    
    public Concept(Long id, String name, String definition, String relatedConcepts, 
                   Paper paper, Double importanceScore) {
        this.id = id;
        this.name = name;
        this.definition = definition;
        this.relatedConcepts = relatedConcepts;
        this.paper = paper;
        this.importanceScore = importanceScore;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDefinition() { return definition; }
    public void setDefinition(String definition) { this.definition = definition; }
    
    public String getRelatedConcepts() { return relatedConcepts; }
    public void setRelatedConcepts(String relatedConcepts) { this.relatedConcepts = relatedConcepts; }
    
    public Paper getPaper() { return paper; }
    public void setPaper(Paper paper) { this.paper = paper; }
    
    public Double getImportanceScore() { return importanceScore; }
    public void setImportanceScore(Double importanceScore) { this.importanceScore = importanceScore; }
}