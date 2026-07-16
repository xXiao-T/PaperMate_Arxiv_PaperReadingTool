package com.papermate.fetch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 创建/编辑抓取任务的请求体。
 * 字段对齐 {@code backend/backend实现指南.md} 成员 5 的设计。
 */
public class CreateFetchTaskRequest {

    /** 任务名称 */
    @NotBlank(message = "任务名称不能为空")
    @Size(min = 1, max = 100, message = "任务名称长度需为 1-100 个字符")
    private String name;

    /** 搜索关键词（支持 arXiv 查询语法，如 {@code "large language model"}） */
    @NotBlank(message = "关键词不能为空")
    @Size(max = 200, message = "关键词长度不能超过 200 个字符")
    private String keywords;

    /** arXiv 分类（如 cs.AI），可空 */
    @Size(max = 100, message = "分类长度不能超过 100 个字符")
    private String category;

    /**
     * 抓取周期：{@code once} / {@code daily} / {@code weekly} / {@code monthly}
     */
    @NotBlank(message = "抓取周期不能为空")
    @Pattern(regexp = "once|daily|weekly|monthly",
             message = "抓取周期只能为 once / daily / weekly / monthly")
    private String freqPeriod;

    /**
     * 执行小时（0-23），配合 daily/weekly/monthly 使用。
     * 对 once 无效。默认建议 9（上午 9 点）。
     */
    @Min(value = 0, message = "执行小时不能小于 0")
    @Max(value = 23, message = "执行小时不能大于 23")
    private Integer freqHour;

    /**
     * 抓取入库后自动附加的标签，逗号分隔（如 "LLM,Transformer"）。
     * 可空。
     */
    @Size(max = 500, message = "自动标签长度不能超过 500 个字符")
    private String autoTags;

    // ─── 无参构造 ───────────────────────────────────────────────

    public CreateFetchTaskRequest() {}

    // ─── Getters / Setters ──────────────────────────────────────

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFreqPeriod() { return freqPeriod; }
    public void setFreqPeriod(String freqPeriod) { this.freqPeriod = freqPeriod; }

    public Integer getFreqHour() { return freqHour; }
    public void setFreqHour(Integer freqHour) { this.freqHour = freqHour; }

    public String getAutoTags() { return autoTags; }
    public void setAutoTags(String autoTags) { this.autoTags = autoTags; }
}
