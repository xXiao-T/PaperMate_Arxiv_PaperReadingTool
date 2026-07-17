package com.papermate.library.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class LibraryPaperVO {
    private final Long id;
    private final Long userPaperId;
    private final String title;
    private final String authors;
    private final LocalDate publishedAt;
    private final List<String> tags;
    private final String paperAbstract;
    private final String arxivUrl;
    private final String arxivId;
    private final String pdfPath;
    private final Boolean favorited;
    private final Boolean starred;
    private final LocalDateTime importedAt;
}
