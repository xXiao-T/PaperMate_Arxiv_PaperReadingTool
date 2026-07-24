package com.papermate.paper.dto;

import com.papermate.paper.entity.Paper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperDTO {
    private Long id;
    private String title;
    private String authors;
    private LocalDate publishedAt;
    private List<String> tags;
    private String paperAbstract;
    private String arxivUrl;
    private String arxivId;
    private String pdfPath;
    private Boolean favorited;
    private Boolean starred;

    public static PaperDTO fromEntity(Paper paper, boolean favorited, boolean starred) {
        return PaperDTO.builder()
            .id(paper.getId())
            .title(paper.getTitle())
            .authors(paper.getAuthors())
            .publishedAt(paper.getPublishedAt())
            .tags(parseTags(paper.getTags()))
            .paperAbstract(paper.getPaperAbstract())
            .arxivUrl(paper.getArxivUrl())
            .arxivId(paper.getArxivId())
            .pdfPath(paper.getPdfPath())
            .favorited(favorited)
            .starred(starred)
            .build();
    }

    static List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
            .map(String::trim)
            .filter(tag -> !tag.isEmpty())
            .distinct()
            .toList();
    }
}
