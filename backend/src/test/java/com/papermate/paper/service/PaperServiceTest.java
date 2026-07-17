package com.papermate.paper.service;

import com.papermate.auth.entity.User;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.dto.PaperImportRequest;
import com.papermate.paper.dto.PaperPageVO;
import com.papermate.paper.entity.Paper;
import com.papermate.paper.repository.PaperRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaperServiceTest {
    @Mock
    private PaperRepository paperRepository;

    @Mock
    private PaperStatusProvider paperStatusProvider;

    @Mock
    private SecurityUtil securityUtil;

    private PaperService paperService;

    @BeforeEach
    void setUp() {
        paperService = new PaperService(
            paperRepository,
            paperStatusProvider,
            securityUtil
        );
    }

    @Test
    void searchReturnsPageAndInjectsCurrentUserStatus() {
        Paper paper = Paper.builder()
            .id(10L)
            .title("Attention Is All You Need")
            .authors("Vaswani et al.")
            .tags("NLP, Transformer")
            .arxivId("1706.03762")
            .pdfPath("pdfs/attention.pdf")
            .build();
        User user = User.builder().id(7L).username("alice").build();

        when(paperRepository.findAll(
            any(Specification.class),
            any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(paper)));
        when(securityUtil.getCurrentUser()).thenReturn(Optional.of(user));
        when(paperStatusProvider.findStatuses(eq(7L), any()))
            .thenReturn(Map.of(10L, new PaperUserStatus(true, true)));

        PaperPageVO result = paperService.search("attention", "NLP", 0, 20);

        assertEquals(1, result.getTotal());
        assertEquals(1, result.getList().size());
        assertEquals(List.of("NLP", "Transformer"), result.getList().get(0).getTags());
        assertEquals("1706.03762", result.getList().get(0).getArxivId());
        assertEquals("pdfs/attention.pdf", result.getList().get(0).getPdfPath());
        assertEquals(true, result.getList().get(0).getFavorited());
        assertEquals(true, result.getList().get(0).getStarred());
    }

    @Test
    void importDeduplicatesVersionedArxivUrl() {
        Paper existing = Paper.builder()
            .id(1L)
            .title("Existing")
            .authors("Author")
            .arxivId("1706.03762")
            .build();
        PaperImportRequest request = new PaperImportRequest();
        request.setTitle("Duplicate");
        request.setAuthors("Author");
        request.setArxivUrl("https://arxiv.org/abs/1706.03762v5");

        when(paperRepository.findByArxivId("1706.03762"))
            .thenReturn(Optional.of(existing));

        PaperDTO result = paperService.importPaper(request);

        assertEquals(1L, result.getId());
        verify(paperRepository, never()).save(any(Paper.class));
    }

    @Test
    void searchRejectsUnsafePageSize() {
        assertThrows(
            IllegalArgumentException.class,
            () -> paperService.search(null, null, 0, 101)
        );
    }

    @Test
    void anonymousSearchUsesEmptyStatus() {
        Paper paper = Paper.builder()
            .id(2L)
            .title("Paper")
            .authors("Author")
            .build();
        when(paperRepository.findAll(
            any(Specification.class),
            any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(paper)));
        when(securityUtil.getCurrentUser()).thenReturn(Optional.empty());

        PaperPageVO result = paperService.search(null, null, 0, 10);

        assertFalse(result.getList().get(0).getFavorited());
        verify(paperStatusProvider, never()).findStatuses(any(), any());
    }
}
