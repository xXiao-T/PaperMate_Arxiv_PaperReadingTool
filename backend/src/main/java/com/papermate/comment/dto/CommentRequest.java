package com.papermate.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {
    @NotBlank(message = "Comment content is required")
    @Size(max = 5000, message = "Comment content must not exceed 5000 characters")
    private String content;
}
