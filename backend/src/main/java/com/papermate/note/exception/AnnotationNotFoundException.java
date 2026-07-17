package com.papermate.note.exception;

public class AnnotationNotFoundException extends RuntimeException {
    public AnnotationNotFoundException(Long annotationId) {
        super("Annotation not found: " + annotationId);
    }
}
