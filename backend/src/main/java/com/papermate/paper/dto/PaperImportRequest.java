package com.papermate.paper.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PaperImportRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 2000, message = "Title must not exceed 2000 characters")
    private String title;

    @NotBlank(message = "Authors are required")
    @Size(max = 5000, message = "Authors must not exceed 5000 characters")
    private String authors;

    private String paperAbstract;
    private String category;
    private LocalDate publishedAt;
    private String arxivUrl;
    private String tags;
}
