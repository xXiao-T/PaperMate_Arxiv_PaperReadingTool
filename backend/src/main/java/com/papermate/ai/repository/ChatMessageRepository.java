package com.papermate.ai.repository;

import com.papermate.ai.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByUserIdAndPaperIdOrderByCreatedAtAsc(Long userId, Long paperId);

    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
}
