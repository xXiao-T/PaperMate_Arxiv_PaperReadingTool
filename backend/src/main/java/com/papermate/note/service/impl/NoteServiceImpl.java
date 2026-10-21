package com.papermate.note.service.impl;

import com.papermate.common.utils.SecurityUtil;
import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;
import com.papermate.note.entity.Annotation;
import com.papermate.note.exception.AnnotationNotFoundException;
import com.papermate.note.repository.AnnotationRepository;
import com.papermate.note.service.NoteService;
import com.papermate.paper.service.PaperService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class NoteServiceImpl implements NoteService {
    private final AnnotationRepository annotationRepository;
    private final PaperService paperService;
    private final SecurityUtil securityUtil;

    public NoteServiceImpl(
            AnnotationRepository annotationRepository,
            PaperService paperService,
            SecurityUtil securityUtil) {
        this.annotationRepository = annotationRepository;
        this.paperService = paperService;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnotationDTO> getAnnotations(Long paperId) {
        paperService.requireExists(paperId);
        return annotationRepository
            .findByUserIdAndPaperIdOrderByPageIndexAscStartOffsetAsc(
                currentUserId(),
                paperId
            )
            .stream()
            .map(AnnotationDTO::fromEntity)
            .toList();
    }

    @Override
    @Transactional
    public AnnotationDTO createAnnotation(
            Long paperId,
            AnnotationRequest request) {
        paperService.requireExists(paperId);
        Annotation annotation = Annotation.builder()
            .userId(currentUserId())
            .paperId(paperId)
            .pageIndex(requiredPageIndex(request.getPageIndex()))
            .startOffset(defaultOffset(request.getStartOffset()))
            .endOffset(defaultOffset(request.getEndOffset()))
            .pdfX(request.getPdfX())
            .pdfY(request.getPdfY())
            .pdfWidth(request.getPdfWidth())
            .pdfHeight(request.getPdfHeight())
            .selectedText(trimNullable(request.getSelectedText()))
            .commentText(trimNullable(request.getCommentText()))
            .annotationType(normalizeType(request.getAnnotationType()))
            .color(request.getColor() == null ? "#FFD700" : request.getColor())
            .build();
        validateAnnotation(annotation);
        return AnnotationDTO.fromEntity(annotationRepository.save(annotation));
    }

    @Override
    @Transactional
    public AnnotationDTO updateAnnotation(
            Long paperId,
            Long annotationId,
            AnnotationRequest request) {
        Annotation annotation = findOwnedAnnotation(paperId, annotationId);
        if (request.getPageIndex() != null) {
            annotation.setPageIndex(request.getPageIndex());
        }
        if (request.getStartOffset() != null) {
            annotation.setStartOffset(request.getStartOffset());
        }
        if (request.getEndOffset() != null) {
            annotation.setEndOffset(request.getEndOffset());
        }
        if (request.getPdfX() != null) {
            annotation.setPdfX(request.getPdfX());
        }
        if (request.getPdfY() != null) {
            annotation.setPdfY(request.getPdfY());
        }
        if (request.getPdfWidth() != null) {
            annotation.setPdfWidth(request.getPdfWidth());
        }
        if (request.getPdfHeight() != null) {
            annotation.setPdfHeight(request.getPdfHeight());
        }
        if (request.getSelectedText() != null) {
            annotation.setSelectedText(request.getSelectedText().trim());
        }
        if (request.getCommentText() != null) {
            annotation.setCommentText(request.getCommentText().trim());
        }
        if (request.getAnnotationType() != null) {
            annotation.setAnnotationType(normalizeType(request.getAnnotationType()));
        }
        if (request.getColor() != null) {
            annotation.setColor(request.getColor());
        }
        validateAnnotation(annotation);
        return AnnotationDTO.fromEntity(annotationRepository.save(annotation));
    }

    @Override
    @Transactional
    public void deleteAnnotation(Long paperId, Long annotationId) {
        annotationRepository.delete(findOwnedAnnotation(paperId, annotationId));
    }

    private Annotation findOwnedAnnotation(Long paperId, Long annotationId) {
        return annotationRepository.findByIdAndUserIdAndPaperId(
            annotationId,
            currentUserId(),
            paperId
        ).orElseThrow(() -> new AnnotationNotFoundException(annotationId));
    }

    private Long currentUserId() {
        try {
            return securityUtil.getCurrentUserId();
        } catch (IllegalStateException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                "User is not authenticated"
            );
        }
    }

    private static int requiredPageIndex(Integer pageIndex) {
        if (pageIndex == null) {
            throw new IllegalArgumentException("Page index is required");
        }
        return pageIndex;
    }

    private static int defaultOffset(Integer offset) {
        return offset == null ? 0 : offset;
    }

    private static String normalizeType(String type) {
        return type == null || type.isBlank()
            ? "note"
            : type.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimNullable(String value) {
        return value == null ? null : value.trim();
    }

    private static void validateAnnotation(Annotation annotation) {
        if (annotation.getPageIndex() == null || annotation.getPageIndex() < 0) {
            throw new IllegalArgumentException("Page index must not be negative");
        }
        if (annotation.getStartOffset() == null || annotation.getStartOffset() < 0
                || annotation.getEndOffset() == null
                || annotation.getEndOffset() < annotation.getStartOffset()) {
            throw new IllegalArgumentException("Invalid annotation offsets");
        }

        String type = normalizeType(annotation.getAnnotationType());
        annotation.setAnnotationType(type);
        switch (type) {
            case "highlight", "underline" -> {
                if (annotation.getSelectedText() == null
                        || annotation.getSelectedText().isBlank()) {
                    throw new IllegalArgumentException(
                        "Selected text is required for highlights and underlines"
                    );
                }
            }
            case "comment", "note" -> {
                if (annotation.getCommentText() == null
                        || annotation.getCommentText().isBlank()) {
                    throw new IllegalArgumentException(
                        "Comment text is required for comments and notes"
                    );
                }
            }
            default -> throw new IllegalArgumentException(
                "Unsupported annotation type: " + type
            );
        }
    }
}
