package com.papermate.learning.repository;

import com.papermate.learning.entity.LearningStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LearningStatsRepository extends JpaRepository<LearningStats, Long> {
    List<LearningStats> findByUserIdAndDateBetweenOrderByDateAsc(
        Long userId,
        LocalDate startDate,
        LocalDate endDate
    );

    Optional<LearningStats> findByUserIdAndDate(Long userId, LocalDate date);

    List<LearningStats> findByUserIdOrderByDateAsc(Long userId);
}
