package com.papermate.comment.service;

import com.papermate.comment.dto.CommentDTO;
import com.papermate.comment.dto.CommentRequest;
import com.papermate.comment.entity.Comment;
import com.papermate.comment.repository.CommentRepository;
import com.papermate.paper.service.PaperService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PaperService paperService;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, paperService);
    }

    @Test
    void getCommentsChecksPaperAndReturnsProjection() {
        CommentDTO comment = CommentDTO.builder()
            .id(2L)
            .userId(7L)
            .username("alice")
            .content("Useful paper")
            .build();
        when(commentRepository.findDtosByPaperId(9L))
            .thenReturn(List.of(comment));

        List<CommentDTO> result = commentService.getComments(9L);

        assertEquals("alice", result.get(0).getUsername());
        verify(paperService).requireExists(9L);
    }

    @Test
    void createCommentTrimsContent() {
        CommentRequest request = request("  Clear explanation  ");
        when(commentRepository.save(any(Comment.class)))
            .thenAnswer(invocation -> {
                Comment comment = invocation.getArgument(0);
                comment.setId(3L);
                return comment;
            });

        CommentDTO result = commentService.createComment(
            7L,
            "alice",
            9L,
            request
        );

        assertEquals("Clear explanation", result.getContent());
        assertEquals("alice", result.getUsername());
    }

    @Test
    void updateRejectsAnotherUsersComment() {
        Comment existing = Comment.builder()
            .id(3L)
            .userId(8L)
            .paperId(9L)
            .content("Original")
            .build();
        when(commentRepository.findByIdAndPaperId(3L, 9L))
            .thenReturn(Optional.of(existing));

        assertThrows(
            AccessDeniedException.class,
            () -> commentService.updateComment(
                7L,
                "alice",
                9L,
                3L,
                request("Changed")
            )
        );
        verify(commentRepository, never()).save(any(Comment.class));
    }

    private static CommentRequest request(String content) {
        CommentRequest request = new CommentRequest();
        request.setContent(content);
        return request;
    }
}
