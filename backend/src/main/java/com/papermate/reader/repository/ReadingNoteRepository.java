package com.papermate.reader.repository;

import com.papermate.reader.entity.ReadingNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingNoteRepository extends JpaRepository<ReadingNote, Long> {

    List<ReadingNote> findByUserIdAndPaperIdOrderByCreatedAtDesc(Long userId, Long paperId);

    List<ReadingNote> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);
}
