package com.papermate.reader.dto;

import com.papermate.reader.entity.ReadingProgress;

public class ProgressDTO {

    private Long id;
    private Long paperId;
    private Integer currentPage;
    private Integer totalPages;
    private Double progressPercentage;
    private Boolean completed;

    // ─── 构造器 ──────────────────────────────────────────────────────────

    public ProgressDTO() {}

    public ProgressDTO(Long id, Long paperId, Integer currentPage, Integer totalPages,
                       Double progressPercentage, Boolean completed) {
        this.id = id;
        this.paperId = paperId;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.progressPercentage = progressPercentage;
        this.completed = completed;
    }

    // ─── fromEntity 工厂方法 ────────────────────────────────────────────

    public static ProgressDTO fromEntity(ReadingProgress progress) {
        ProgressDTO dto = new ProgressDTO();
        dto.setId(progress.getId());
        dto.setPaperId(progress.getPaperId());
        dto.setCurrentPage(progress.getCurrentPage());
        dto.setTotalPages(progress.getTotalPages());
        dto.setProgressPercentage(progress.getProgressPercentage());
        dto.setCompleted(progress.getProgressPercentage() != null && progress.getProgressPercentage() >= 100.0);
        return dto;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getPaperId() { return paperId; }

    public Integer getCurrentPage() { return currentPage; }

    public Integer getTotalPages() { return totalPages; }

    public Double getProgressPercentage() { return progressPercentage; }

    public Boolean getCompleted() { return completed; }

    // ─── Setters ────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }

    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }

    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }

    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }

    public void setCompleted(Boolean completed) { this.completed = completed; }
}