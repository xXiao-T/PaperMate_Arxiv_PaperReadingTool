package com.papermate.comment.repository;

import com.papermate.comment.dto.CommentDTO;
import com.papermate.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("""
        select new com.papermate.comment.dto.CommentDTO(
            c.id,
            c.content,
            c.userId,
            author.username,
            c.createdAt
        )
        from Comment c
        left join User author on author.id = c.userId
        where c.paperId = :paperId
        order by c.createdAt desc
        """)
    List<CommentDTO> findDtosByPaperId(@Param("paperId") Long paperId);

    Optional<Comment> findByIdAndPaperId(Long id, Long paperId);
}
