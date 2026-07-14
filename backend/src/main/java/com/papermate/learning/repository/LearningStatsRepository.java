package com.papermate.learning.repository;

import com.papermate.learning.entity.LearningStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningStatsRepository extends JpaRepository<LearningStats, Long> {

    Optional<LearningStats> findByUserId(Long userId);
}
