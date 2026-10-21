package com.papermate.learning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
    name = "learning_stats",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Builder.Default
    @Column(name = "read_count", nullable = false)
    private Integer readCount = 0;

    @Builder.Default
    @Column(name = "deep_read_count", nullable = false)
    private Integer deepReadCount = 0;

    @Builder.Default
    @Column(name = "reading_minutes", nullable = false)
    private Long readingMinutes = 0L;

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDate.now();
        }
        if (readCount == null) {
            readCount = 0;
        }
        if (deepReadCount == null) {
            deepReadCount = 0;
        }
        if (readingMinutes == null) {
            readingMinutes = 0L;
        }
    }
}
