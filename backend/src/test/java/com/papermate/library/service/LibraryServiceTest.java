package com.papermate.library.service;

import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.entity.UserPaper;
import com.papermate.library.repository.UserPaperRepository;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.service.PaperService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {
    @Mock
    private UserPaperRepository userPaperRepository;

    @Mock
    private PaperService paperService;

    private LibraryService libraryService;

    @BeforeEach
    void setUp() {
        libraryService = new LibraryService(userPaperRepository, paperService);
    }

    @Test
    void getFavoritesJoinsPaperDataInOneBatch() {
        UserPaper relation = relation(false);
        when(userPaperRepository.findByUserIdAndFavoritedTrueOrderByImportedAtDesc(7L))
            .thenReturn(List.of(relation));
        when(paperService.getSummariesByIds(List.of(9L)))
            .thenReturn(Map.of(9L, paper()));

        List<LibraryPaperVO> result = libraryService.getFavorites(7L);

        assertTrue(result.get(0).getFavorited());
        assertEquals("1810.04805", result.get(0).getArxivId());
        assertEquals("pdfs/bert.pdf", result.get(0).getPdfPath());
        verify(paperService).getSummariesByIds(List.of(9L));
    }

    @Test
    void addFavoriteReactivatesSoftDeletedRelation() {
        UserPaper relation = relation(false);
        when(paperService.getSummaryById(9L)).thenReturn(paper());
        when(userPaperRepository.findByUserIdAndPaperId(7L, 9L))
            .thenReturn(Optional.of(relation));
        when(userPaperRepository.save(any(UserPaper.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        LibraryPaperVO result = libraryService.addFavorite(7L, 9L);

        assertTrue(result.getFavorited());
        assertTrue(relation.getFavorited());
    }

    @Test
    void removeFavoriteAlsoClearsStar() {
        UserPaper relation = relation(true);
        when(userPaperRepository.findByUserIdAndPaperId(7L, 9L))
            .thenReturn(Optional.of(relation));

        libraryService.removeFavorite(7L, 9L);

        assertFalse(relation.getFavorited());
        assertFalse(relation.getStarred());
        verify(userPaperRepository).save(relation);
    }

    private static UserPaper relation(boolean starred) {
        return UserPaper.builder()
            .id(1L)
            .userId(7L)
            .paperId(9L)
            .favorited(true)
            .starred(starred)
            .importedAt(LocalDateTime.now())
            .build();
    }

    private static PaperDTO paper() {
        return PaperDTO.builder()
            .id(9L)
            .title("Paper")
            .authors("Author")
            .tags(List.of("NLP"))
            .arxivId("1810.04805")
            .pdfPath("pdfs/bert.pdf")
            .build();
    }
}
