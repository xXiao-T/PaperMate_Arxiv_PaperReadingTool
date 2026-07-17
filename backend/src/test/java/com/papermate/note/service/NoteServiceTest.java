package com.papermate.note.service;

import com.papermate.common.utils.SecurityUtil;
import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;
import com.papermate.note.entity.Annotation;
import com.papermate.note.repository.AnnotationRepository;
import com.papermate.note.service.impl.NoteServiceImpl;
import com.papermate.paper.service.PaperService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {
    @Mock
    private AnnotationRepository annotationRepository;

    @Mock
    private PaperService paperService;

    @Mock
    private SecurityUtil securityUtil;

    private NoteService noteService;

    @BeforeEach
    void setUp() {
        noteService = new NoteServiceImpl(
            annotationRepository,
            paperService,
            securityUtil
        );
    }

    @Test
    void commentAllowsEmptySelectionAndPreservesPdfCoordinates() {
        when(securityUtil.getCurrentUserId()).thenReturn(7L);
        when(annotationRepository.save(any(Annotation.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        AnnotationRequest request = request("comment", "", "My note");
        request.setPdfX(12.5);
        request.setPdfY(27.0);

        AnnotationDTO result = noteService.createAnnotation(9L, request);

        assertEquals("comment", result.getAnnotationType());
        assertEquals(12.5, result.getPdfX());
        assertEquals(27.0, result.getPdfY());
        verify(paperService).requireExists(9L);
    }

    @Test
    void highlightRequiresSelectedText() {
        when(securityUtil.getCurrentUserId()).thenReturn(7L);

        assertThrows(
            IllegalArgumentException.class,
            () -> noteService.createAnnotation(
                9L,
                request("highlight", " ", null)
            )
        );
        verify(annotationRepository, never()).save(any(Annotation.class));
    }

    @Test
    void updateUsesPaperAndUserScopedLookup() {
        when(securityUtil.getCurrentUserId()).thenReturn(7L);
        Annotation existing = Annotation.builder()
            .id(4L)
            .userId(7L)
            .paperId(9L)
            .pageIndex(1)
            .startOffset(2)
            .endOffset(4)
            .selectedText("Text")
            .commentText("Old")
            .annotationType("highlight")
            .color("#FFD700")
            .build();
        when(annotationRepository.findByIdAndUserIdAndPaperId(4L, 7L, 9L))
            .thenReturn(Optional.of(existing));
        when(annotationRepository.save(existing)).thenReturn(existing);
        AnnotationRequest request = new AnnotationRequest();
        request.setCommentText("Updated");

        AnnotationDTO result = noteService.updateAnnotation(9L, 4L, request);

        assertEquals("Updated", result.getCommentText());
        assertEquals("Text", result.getSelectedText());
    }

    private static AnnotationRequest request(
            String type,
            String selectedText,
            String commentText) {
        AnnotationRequest request = new AnnotationRequest();
        request.setPageIndex(1);
        request.setStartOffset(0);
        request.setEndOffset(0);
        request.setSelectedText(selectedText);
        request.setCommentText(commentText);
        request.setAnnotationType(type);
        request.setColor("#FFD700");
        return request;
    }
}
