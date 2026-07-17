package com.papermate.library.service;

import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.entity.UserPaper;
import com.papermate.library.repository.UserPaperRepository;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.service.PaperService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

@Service
public class LibraryService {
    private final UserPaperRepository userPaperRepository;
    private final PaperService paperService;

    public LibraryService(UserPaperRepository userPaperRepository, PaperService paperService) {
        this.userPaperRepository = userPaperRepository;
        this.paperService = paperService;
    }

    @Transactional(readOnly = true)
    public List<LibraryPaperVO> getFavorites(Long userId) {
        return joinPapers(
            userPaperRepository.findByUserIdAndFavoritedTrueOrderByImportedAtDesc(userId)
        );
    }

    @Transactional
    public LibraryPaperVO addFavorite(Long userId, Long paperId) {
        PaperDTO paper = paperService.getSummaryById(paperId);
        UserPaper relation = userPaperRepository.findByUserIdAndPaperId(userId, paperId)
            .orElseGet(() -> UserPaper.builder()
                .userId(userId)
                .paperId(paperId)
                .build());
        relation.setFavorited(true);
        relation.setImportedAt(LocalDateTime.now());
        return toVO(userPaperRepository.save(relation), paper);
    }

    @Transactional
    public void removeFavorite(Long userId, Long paperId) {
        userPaperRepository.findByUserIdAndPaperId(userId, paperId).ifPresent(relation -> {
            relation.setFavorited(false);
            relation.setStarred(false);
            userPaperRepository.save(relation);
        });
    }

    @Transactional
    public LibraryPaperVO toggleStar(Long userId, Long paperId) {
        PaperDTO paper = paperService.getSummaryById(paperId);
        UserPaper relation = userPaperRepository.findByUserIdAndPaperId(userId, paperId)
            .orElseGet(() -> UserPaper.builder()
                .userId(userId)
                .paperId(paperId)
                .favorited(true)
                .starred(false)
                .importedAt(LocalDateTime.now())
                .build());
        if (!Boolean.TRUE.equals(relation.getFavorited())) {
            relation.setFavorited(true);
            relation.setImportedAt(LocalDateTime.now());
        }
        relation.setStarred(!Boolean.TRUE.equals(relation.getStarred()));
        return toVO(userPaperRepository.save(relation), paper);
    }

    @Transactional(readOnly = true)
    public List<LibraryPaperVO> getRecords(Long userId, String period) {
        LocalDateTime start = periodStart(period);
        List<UserPaper> records = userPaperRepository.findByUserIdOrderByImportedAtDesc(userId);
        if (start != null) {
            records = records.stream()
                .filter(record -> record.getImportedAt() != null)
                .filter(record -> !record.getImportedAt().isBefore(start))
                .toList();
        }
        return joinPapers(records);
    }

    private List<LibraryPaperVO> joinPapers(List<UserPaper> relations) {
        if (relations.isEmpty()) {
            return List.of();
        }
        Map<Long, PaperDTO> papers = paperService.getSummariesByIds(
            relations.stream().map(UserPaper::getPaperId).toList()
        );
        return relations.stream()
            .filter(relation -> papers.containsKey(relation.getPaperId()))
            .map(relation -> toVO(relation, papers.get(relation.getPaperId())))
            .toList();
    }

    private static LibraryPaperVO toVO(UserPaper relation, PaperDTO paper) {
        return LibraryPaperVO.builder()
            .id(paper.getId())
            .userPaperId(relation.getId())
            .title(paper.getTitle())
            .authors(paper.getAuthors())
            .publishedAt(paper.getPublishedAt())
            .tags(paper.getTags())
            .paperAbstract(paper.getPaperAbstract())
            .arxivUrl(paper.getArxivUrl())
            .arxivId(paper.getArxivId())
            .pdfPath(paper.getPdfPath())
            .favorited(Boolean.TRUE.equals(relation.getFavorited()))
            .starred(Boolean.TRUE.equals(relation.getStarred()))
            .importedAt(relation.getImportedAt())
            .build();
    }

    private static LocalDateTime periodStart(String period) {
        String normalized = period == null ? "all" : period.trim().toLowerCase();
        LocalDate today = LocalDate.now();
        return switch (normalized) {
            case "weekly" -> today
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay();
            case "monthly" -> today.withDayOfMonth(1).atStartOfDay();
            case "all" -> null;
            default -> throw new IllegalArgumentException(
                "Period must be weekly, monthly, or all"
            );
        };
    }
}
