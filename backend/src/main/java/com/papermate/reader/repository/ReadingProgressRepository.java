package com.papermate.reader.repository;

import com.papermate.reader.entity.ReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {

    Optional<ReadingProgress> findByUserIdAndPaperId(Long userId, Long paperId);

    long countByUserIdAndProgressPercentageGreaterThan(Long userId, Double threshold);
}
