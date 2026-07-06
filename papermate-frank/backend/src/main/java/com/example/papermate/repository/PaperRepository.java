package com.example.papermate.repository;

import com.example.papermate.entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {
    
    Optional<Paper> findByArxivId(String arxivId);
    
    boolean existsByArxivId(String arxivId);
    
    List<Paper> findByCategory(String category);
    
    List<Paper> findByTitleContainingIgnoreCase(String title);
    
    List<Paper> findByAuthorsContainingIgnoreCase(String author);
    
    List<Paper> findByPublishedDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Paper> findByIsProcessed(Boolean isProcessed);
    
    @Query("SELECT p FROM Paper p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.authors) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.concepts) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Paper> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Paper p WHERE p.category = :category AND LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Paper> searchByCategoryAndKeyword(@Param("category") String category, @Param("keyword") String keyword);
    
    List<Paper> findTop10ByOrderByPublishedDateDesc();
    
    @Query("SELECT DISTINCT p.category FROM Paper p ORDER BY p.category")
    List<String> findAllCategories();
}