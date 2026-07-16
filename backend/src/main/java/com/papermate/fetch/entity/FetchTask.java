package com.papermate.fetch.entity;

import com.papermate.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 定时抓取任务 —— 用户设定关键词和频率，系统定时从 arXiv 拉取新论文。
 *
 * <p>字段对齐 {@code backend/backend实现指南.md} 成员 5 的 fetch 模块设计。</p>
 */
@Entity
@Table(name = "fetch_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FetchTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 任务名称，用户自定义 */
    @Column(length = 100)
    private String name;

    /** 所属用户 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 搜索关键词（支持 arXiv 查询语法） */
    @Column(length = 200)
    private String keywords;

    /** arXiv 分类（如 cs.AI, cs.CL），可空表示不限分类 */
    @Column(length = 100)
    private String category;

    /**
     * 抓取周期。
     * <ul>
     *   <li>{@code "once"} — 仅执行一次</li>
     *   <li>{@code "daily"} — 每天</li>
     *   <li>{@code "weekly"} — 每周</li>
     *   <li>{@code "monthly"} — 每月</li>
     * </ul>
     */
    @Column(name = "freq_period", length = 20)
    private String freqPeriod;

    /**
     * 执行时间的小时（0-23），配合 daily/weekly/monthly 使用。
     * 例如 {@code 9} 表示上午 9 点执行。对 {@code "once"} 无效。
     */
    @Column(name = "freq_hour")
    private Integer freqHour;

    /**
     * 抓取入库后自动附加的标签，逗号分隔（如 "LLM,Transformer"）。
     * 可空。
     */
    @Column(name = "auto_tags", length = 500)
    private String autoTags;

    /**
     * 任务状态。
     * <ul>
     *   <li>{@code "active"} — 活跃，定时调度会执行</li>
     *   <li>{@code "paused"} — 暂停，定时调度跳过</li>
     * </ul>
     */
    @Column(length = 16)
    @Builder.Default
    private String status = "active";

    /** 上次执行时间 */
    @Column(name = "last_run_at")
    private LocalDateTime lastRunAt;

    /** 下次计划执行时间（调度器据此判断是否到期） */
    @Column(name = "next_run_at")
    private LocalDateTime nextRunAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
