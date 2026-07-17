package com.papermate.library.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LibraryPaperRequest {
    @NotNull(message = "Paper ID is required")
    @Positive(message = "Paper ID must be positive")
    private Long paperId;
}
