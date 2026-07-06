package com.example.papermate.dto;

public class ConceptDTO {
    
    private Long id;
    private String name;
    private String definition;
    private String relatedConcepts;
    private Long paperId;
    private Double importanceScore;
    
    public ConceptDTO() {}
    
    public ConceptDTO(Long id, String name, String definition, String relatedConcepts, 
                      Long paperId, Double importanceScore) {
        this.id = id;
        this.name = name;
        this.definition = definition;
        this.relatedConcepts = relatedConcepts;
        this.paperId = paperId;
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
    
    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }
    
    public Double getImportanceScore() { return importanceScore; }
    public void setImportanceScore(Double importanceScore) { this.importanceScore = importanceScore; }
}