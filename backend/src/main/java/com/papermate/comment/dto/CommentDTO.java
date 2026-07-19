package com.papermate.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CommentDTO {
    private final Long id;
    private final String content;
    private final Long userId;
    private final String username;
    private final LocalDateTime createdAt;
}
