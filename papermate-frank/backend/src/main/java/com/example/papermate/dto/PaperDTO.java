package com.example.papermate.dto;

import java.time.LocalDate;
import java.util.List;

public class PaperDTO {
    
    private Long id;
    private String arxivId;
    private String title;
    private String abstractText;
    private String authors;
    private String category;
    private LocalDate publishedDate;
    private LocalDate updatedDate;
    private String pdfUrl;
    private String htmlUrl;
    private String summary;
    private String concepts;
    private String methods;
    private String conclusions;
    private Integer citationCount;
    private Boolean isProcessed;
    private List<ConceptDTO> conceptList;
    private List<QuestionAnswerDTO> qaList;
    private List<UserNoteDTO> notes;
    
    public PaperDTO() {}
    
    public PaperDTO(Long id, String arxivId, String title, String abstractText, String authors, 
                    String category, LocalDate publishedDate, LocalDate updatedDate, String pdfUrl, 
                    String htmlUrl, String summary, String concepts, String methods, String conclusions, 
                    Integer citationCount, Boolean isProcessed, List<ConceptDTO> conceptList, 
                    List<QuestionAnswerDTO> qaList, List<UserNoteDTO> notes) {
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
    
    public List<ConceptDTO> getConceptList() { return conceptList; }
    public void setConceptList(List<ConceptDTO> conceptList) { this.conceptList = conceptList; }
    
    public List<QuestionAnswerDTO> getQaList() { return qaList; }
    public void setQaList(List<QuestionAnswerDTO> qaList) { this.qaList = qaList; }
    
    public List<UserNoteDTO> getNotes() { return notes; }
    public void setNotes(List<UserNoteDTO> notes) { this.notes = notes; }
}