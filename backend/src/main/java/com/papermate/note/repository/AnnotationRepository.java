package com.papermate.note.repository;

import com.papermate.note.entity.Annotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {

    List<Annotation> findByUserIdAndPaperIdOrderByPageIndexAscStartOffsetAsc(Long userId, Long paperId);

    Optional<Annotation> findByIdAndUserId(Long id, Long userId);

    void deleteByPaperId(Long paperId);
}