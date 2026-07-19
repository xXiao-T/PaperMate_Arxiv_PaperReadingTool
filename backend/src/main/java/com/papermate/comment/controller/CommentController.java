package com.papermate.comment.controller;

import com.papermate.auth.entity.User;
import com.papermate.comment.dto.CommentDTO;
import com.papermate.comment.dto.CommentRequest;
import com.papermate.comment.exception.CommentNotFoundException;
import com.papermate.comment.service.CommentService;
import com.papermate.common.Result;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.paper.exception.PaperNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/papers/{paperId}/comments")
public class CommentController {
    private final CommentService commentService;
    private final SecurityUtil securityUtil;

    public CommentController(CommentService commentService, SecurityUtil securityUtil) {
        this.commentService = commentService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public Result<List<CommentDTO>> getComments(@PathVariable Long paperId) {
        return Result.success(commentService.getComments(paperId));
    }

    @PostMapping
    public Result<CommentDTO> createComment(
            @PathVariable Long paperId,
            @Valid @RequestBody CommentRequest request) {
        User user = currentUser();
        return Result.success(
            commentService.createComment(
                user.getId(),
                user.getUsername(),
                paperId,
                request
            )
        );
    }

    @PutMapping("/{commentId}")
    public Result<CommentDTO> updateComment(
            @PathVariable Long paperId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {
        User user = currentUser();
        return Result.success(
            commentService.updateComment(
                user.getId(),
                user.getUsername(),
                paperId,
                commentId,
                request
            )
        );
    }

    @DeleteMapping("/{commentId}")
    public Result<Void> deleteComment(
            @PathVariable Long paperId,
            @PathVariable Long commentId) {
        commentService.deleteComment(currentUser().getId(), paperId, commentId);
        return Result.success();
    }

    @ExceptionHandler({PaperNotFoundException.class, CommentNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFound(RuntimeException exception) {
        return Result.notFound(exception.getMessage());
    }

    private User currentUser() {
        return securityUtil.getCurrentUser()
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(
                "User is not authenticated"
            ));
    }
}
