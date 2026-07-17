package com.papermate.paper.dto;

import com.papermate.paper.entity.Paper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperDetailVO {
    private Long id;
    private String arxivId;
    private String title;
    private String authors;
    private String paperAbstract;
    private String category;
    private LocalDate publishedAt;
    private String arxivUrl;
    private List<String> tags;
    private String pdfPath;
    private LocalDateTime createdAt;
    private Boolean favorited;
    private Boolean starred;

    public static PaperDetailVO fromEntity(Paper paper, boolean favorited, boolean starred) {
        return PaperDetailVO.builder()
            .id(paper.getId())
            .arxivId(paper.getArxivId())
            .title(paper.getTitle())
            .authors(paper.getAuthors())
            .paperAbstract(paper.getPaperAbstract())
            .category(paper.getCategory())
            .publishedAt(paper.getPublishedAt())
            .arxivUrl(paper.getArxivUrl())
            .tags(PaperDTO.parseTags(paper.getTags()))
            .pdfPath(paper.getPdfPath())
            .createdAt(paper.getCreatedAt())
            .favorited(favorited)
            .starred(starred)
            .build();
    }
}
