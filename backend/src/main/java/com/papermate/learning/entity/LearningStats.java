package com.papermate.learning.entity;

import com.papermate.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_papers_read")
    @Builder.Default
    private Integer totalPapersRead = 0;

    @Column(name = "total_reading_time")
    @Builder.Default
    private Long totalReadingTime = 0L;  // seconds

    @Column(name = "total_notes")
    @Builder.Default
    private Integer totalNotes = 0;

    @Column(name = "papers_this_week")
    @Builder.Default
    private Integer papersThisWeek = 0;

    @Column(name = "streak_days")
    @Builder.Default
    private Integer streakDays = 0;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
