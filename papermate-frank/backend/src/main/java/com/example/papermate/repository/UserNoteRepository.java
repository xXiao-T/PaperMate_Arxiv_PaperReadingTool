package com.example.papermate.repository;

import com.example.papermate.entity.UserNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNoteRepository extends JpaRepository<UserNote, Long> {
    
    List<UserNote> findByPaperId(Long paperId);
    
    List<UserNote> findByUserId(Long userId);
    
    List<UserNote> findByPaperIdAndUserId(Long paperId, Long userId);
    
    List<UserNote> findByPaperIdAndNoteType(Long paperId, String noteType);
}