package com.papermate.comment.service;

import com.papermate.comment.dto.CommentDTO;
import com.papermate.comment.dto.CommentRequest;
import com.papermate.comment.entity.Comment;
import com.papermate.comment.exception.CommentNotFoundException;
import com.papermate.comment.repository.CommentRepository;
import com.papermate.paper.service.PaperService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PaperService paperService;

    public CommentService(CommentRepository commentRepository, PaperService paperService) {
        this.commentRepository = commentRepository;
        this.paperService = paperService;
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getComments(Long paperId) {
        paperService.requireExists(paperId);
        return commentRepository.findDtosByPaperId(paperId);
    }

    @Transactional
    public CommentDTO createComment(
            Long userId,
            String username,
            Long paperId,
            CommentRequest request) {
        paperService.requireExists(paperId);
        Comment comment = Comment.builder()
            .userId(userId)
            .paperId(paperId)
            .content(request.getContent().trim())
            .build();
        return toDTO(commentRepository.save(comment), username);
    }

    @Transactional
    public CommentDTO updateComment(
            Long userId,
            String username,
            Long paperId,
            Long commentId,
            CommentRequest request) {
        Comment comment = getOwnedComment(userId, paperId, commentId);
        comment.setContent(request.getContent().trim());
        return toDTO(commentRepository.save(comment), username);
    }

    @Transactional
    public void deleteComment(Long userId, Long paperId, Long commentId) {
        commentRepository.delete(getOwnedComment(userId, paperId, commentId));
    }

    private Comment getOwnedComment(Long userId, Long paperId, Long commentId) {
        Comment comment = commentRepository.findByIdAndPaperId(commentId, paperId)
            .orElseThrow(() -> new CommentNotFoundException(commentId));
        if (!userId.equals(comment.getUserId())) {
            throw new AccessDeniedException(
                "Only the comment author can modify this comment"
            );
        }
        return comment;
    }

    private static CommentDTO toDTO(Comment comment, String username) {
        return CommentDTO.builder()
            .id(comment.getId())
            .content(comment.getContent())
            .userId(comment.getUserId())
            .username(username)
            .createdAt(comment.getCreatedAt())
            .build();
    }
}
