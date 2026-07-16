package com.papermate.note.service;

import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;

import java.util.List;

public interface NoteService {

    List<AnnotationDTO> getAnnotations(Long paperId);

    AnnotationDTO createAnnotation(Long paperId, AnnotationRequest request);

    AnnotationDTO updateAnnotation(Long annotationId, AnnotationRequest request);

    void deleteAnnotation(Long annotationId);
}