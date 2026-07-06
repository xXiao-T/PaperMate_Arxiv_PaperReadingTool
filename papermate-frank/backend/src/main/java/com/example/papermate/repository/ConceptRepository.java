package com.example.papermate.repository;

import com.example.papermate.entity.Concept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConceptRepository extends JpaRepository<Concept, Long> {
    
    List<Concept> findByPaperId(Long paperId);
    
    List<Concept> findByNameContainingIgnoreCase(String name);
    
    List<Concept> findByPaperIdOrderByImportanceScoreDesc(Long paperId);
}