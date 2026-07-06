package com.example.papermate.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "papers")
public class Paper {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String arxivId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 5000)
    private String abstractText;
    
    @Column
    private String authors;
    
    @Column
    private String category;
    
    @Column(name = "published_date")
    private LocalDate publishedDate;
    
    @Column(name = "updated_date")
    private LocalDate updatedDate;
    
    @Column(name = "pdf_url")
    private String pdfUrl;
    
    @Column(name = "html_url")
    private String htmlUrl;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String concepts;
    
    @Column(columnDefinition = "TEXT")
    private String methods;
    
    @Column(columnDefinition = "TEXT")
    private String conclusions;
    
    @Column(name = "citation_count")
    private Integer citationCount = 0;
    
    @Column(name = "is_processed")
    private Boolean isProcessed = false;
    
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Concept> conceptList = new ArrayList<>();
    
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionAnswer> qaList = new ArrayList<>();
    
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserNote> notes = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }
    
    public Paper() {}
    
    public Paper(Long id, String arxivId, String title, String abstractText, String authors, 
                 String category, LocalDate publishedDate, LocalDate updatedDate, String pdfUrl, 
                 String htmlUrl, String summary, String concepts, String methods, String conclusions, 
                 Integer citationCount, Boolean isProcessed, List<Concept> conceptList, 
                 List<QuestionAnswer> qaList, List<UserNote> notes, LocalDate createdAt) {
        this.id = id;
        this.arxivId = arxivId;
        this.title = title;
        this.abstractText = abstractText;
        this.authors = authors;
        this.category = category;
        this.publishedDate = publishedDate;
        this.updatedDate = updatedDate;
        this.pdfUrl = pdfUrl;
        this.htmlUrl = htmlUrl;
        this.summary = summary;
        this.concepts = concepts;
        this.methods = methods;
        this.conclusions = conclusions;
        this.citationCount = citationCount;
        this.isProcessed = isProcessed;
        this.conceptList = conceptList;
        this.qaList = qaList;
        this.notes = notes;
        this.createdAt = createdAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getArxivId() { return arxivId; }
    public void setArxivId(String arxivId) { this.arxivId = arxivId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }
    
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public LocalDate getPublishedDate() { return publishedDate; }
    public void setPublishedDate(LocalDate publishedDate) { this.publishedDate = publishedDate; }
    
    public LocalDate getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDate updatedDate) { this.updatedDate = updatedDate; }
    
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
    
    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getConcepts() { return concepts; }
    public void setConcepts(String concepts) { this.concepts = concepts; }
    
    public String getMethods() { return methods; }
    public void setMethods(String methods) { this.methods = methods; }
    
    public String getConclusions() { return conclusions; }
    public void setConclusions(String conclusions) { this.conclusions = conclusions; }
    
    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }
    
    public Boolean getIsProcessed() { return isProcessed; }
    public void setIsProcessed(Boolean isProcessed) { this.isProcessed = isProcessed; }
    
    public List<Concept> getConceptList() { return conceptList; }
    public void setConceptList(List<Concept> conceptList) { this.conceptList = conceptList; }
    
    public List<QuestionAnswer> getQaList() { return qaList; }
    public void setQaList(List<QuestionAnswer> qaList) { this.qaList = qaList; }
    
    public List<UserNote> getNotes() { return notes; }
    public void setNotes(List<UserNote> notes) { this.notes = notes; }
    
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}