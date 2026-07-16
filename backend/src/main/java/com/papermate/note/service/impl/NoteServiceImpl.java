package com.papermate.note.service.impl;

import com.papermate.auth.entity.User;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;
import com.papermate.note.entity.Annotation;
import com.papermate.note.repository.AnnotationRepository;
import com.papermate.note.service.NoteService;
import com.papermate.paper.entity.Paper;
import com.papermate.paper.repository.PaperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteServiceImpl implements NoteService {

    private final AnnotationRepository annotationRepository;
    private final PaperRepository paperRepository;
    private final SecurityUtil securityUtil;

    // 手动构造器（替代 @RequiredArgsConstructor）
    public NoteServiceImpl(AnnotationRepository annotationRepository,
                           PaperRepository paperRepository,
                           SecurityUtil securityUtil) {
        this.annotationRepository = annotationRepository;
        this.paperRepository = paperRepository;
        this.securityUtil = securityUtil;
    }

    @Override
    public List<AnnotationDTO> getAnnotations(Long paperId) {
        User currentUser = securityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalArgumentException("用户未登录"));

        return annotationRepository
                .findByUserIdAndPaperIdOrderByPageIndexAscStartOffsetAsc(
                        currentUser.getId(), paperId)
                .stream()
                .map(AnnotationDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public AnnotationDTO createAnnotation(Long paperId, AnnotationRequest request) {
        User currentUser = securityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalArgumentException("用户未登录"));

        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new IllegalArgumentException("论文不存在"));

        Annotation annotation = Annotation.builder()
                .user(currentUser)
                .paper(paper)
                .pageIndex(request.getPageIndex())
                .startOffset(request.getStartOffset())
                .endOffset(request.getEndOffset())
                .selectedText(request.getSelectedText())
                .commentText(request.getCommentText())
                .annotationType(request.getAnnotationType() != null ? request.getAnnotationType() : "comment")
                .color(request.getColor() != null ? request.getColor() : "#FFD700")
                .build();

        Annotation saved = annotationRepository.save(annotation);
        return AnnotationDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public AnnotationDTO updateAnnotation(Long annotationId, AnnotationRequest request) {
        User currentUser = securityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalArgumentException("用户未登录"));

        Annotation annotation = annotationRepository.findByIdAndUserId(annotationId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("批注不存在或无权修改"));

        // 部分更新
        if (request.getCommentText() != null) {
            annotation.setCommentText(request.getCommentText());
        }
        if (request.getColor() != null) {
            annotation.setColor(request.getColor());
        }
        if (request.getAnnotationType() != null) {
            annotation.setAnnotationType(request.getAnnotationType());
        }

        Annotation updated = annotationRepository.save(annotation);
        return AnnotationDTO.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteAnnotation(Long annotationId) {
        User currentUser = securityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalArgumentException("用户未登录"));

        Annotation annotation = annotationRepository.findByIdAndUserId(annotationId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("批注不存在或无权删除"));

        annotationRepository.delete(annotation);
    }
}