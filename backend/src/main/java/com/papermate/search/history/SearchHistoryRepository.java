package com.papermate.search.history;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    void deleteByUserId(Long userId);
    void deleteByUserIdAndQuery(Long userId, String query);
}