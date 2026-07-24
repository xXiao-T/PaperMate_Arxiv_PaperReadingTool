package com.papermate.fetch.dto;

import com.papermate.fetch.entity.FetchTask;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 抓取任务的响应 DTO，用于列表和详情返回。
 * 字段对齐 {@code backend/backend实现指南.md} 成员 5 的设计。
 */
public class FetchTaskDTO {

    private Long id;
    private String name;
    private Long userId;
    private String username;
    private String keywords;
    private String category;
    private String freqPeriod;
    private Integer freqHour;
    /** 标签展开为列表（逗号拆分） */
    private List<String> autoTags;
    private String status;
    private LocalDateTime lastRunAt;
    private LocalDateTime nextRunAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 从实体构造 DTO，逗号分隔的 autoTags 自动拆分为 {@code List<String>}。
     */
    public static FetchTaskDTO fromEntity(FetchTask task) {
        FetchTaskDTO dto = new FetchTaskDTO();
        dto.setId(task.getId());
        dto.setName(task.getName());
        if (task.getUser() != null) {
            dto.setUserId(task.getUser().getId());
            dto.setUsername(task.getUser().getUsername());
        }
        dto.setKeywords(task.getKeywords());
        dto.setCategory(task.getCategory());
        dto.setFreqPeriod(task.getFreqPeriod());
        dto.setFreqHour(task.getFreqHour());
        dto.setAutoTags(task.getAutoTags() != null
            ? Arrays.asList(task.getAutoTags().split("\\s*,\\s*"))
            : Collections.emptyList());
        dto.setStatus(task.getStatus());
        dto.setLastRunAt(task.getLastRunAt());
        dto.setNextRunAt(task.getNextRunAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    // ─── Getters / Setters ──────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFreqPeriod() { return freqPeriod; }
    public void setFreqPeriod(String freqPeriod) { this.freqPeriod = freqPeriod; }

    public Integer getFreqHour() { return freqHour; }
    public void setFreqHour(Integer freqHour) { this.freqHour = freqHour; }

    public List<String> getAutoTags() { return autoTags; }
    public void setAutoTags(List<String> autoTags) { this.autoTags = autoTags; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastRunAt() { return lastRunAt; }
    public void setLastRunAt(LocalDateTime lastRunAt) { this.lastRunAt = lastRunAt; }

    public LocalDateTime getNextRunAt() { return nextRunAt; }
    public void setNextRunAt(LocalDateTime nextRunAt) { this.nextRunAt = nextRunAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
