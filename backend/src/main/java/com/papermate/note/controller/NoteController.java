package com.papermate.note.controller;

import com.papermate.common.Result;
import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;
import com.papermate.note.exception.AnnotationNotFoundException;
import com.papermate.note.service.NoteService;
import com.papermate.paper.exception.PaperNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/papers/{paperId}/annotations")
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public Result<List<AnnotationDTO>> getAnnotations(@PathVariable Long paperId) {
        return Result.success(noteService.getAnnotations(paperId));
    }

    @PostMapping
    public Result<AnnotationDTO> createAnnotation(
            @PathVariable Long paperId,
            @Valid @RequestBody AnnotationRequest request) {
        return Result.success(noteService.createAnnotation(paperId, request));
    }

    @PutMapping("/{annotationId}")
    public Result<AnnotationDTO> updateAnnotation(
            @PathVariable Long paperId,
            @PathVariable Long annotationId,
            @Valid @RequestBody AnnotationRequest request) {
        return Result.success(
            noteService.updateAnnotation(paperId, annotationId, request)
        );
    }

    @DeleteMapping("/{annotationId}")
    public Result<Void> deleteAnnotation(
            @PathVariable Long paperId,
            @PathVariable Long annotationId) {
        noteService.deleteAnnotation(paperId, annotationId);
        return Result.success();
    }

    @ExceptionHandler({PaperNotFoundException.class, AnnotationNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFound(RuntimeException exception) {
        return Result.notFound(exception.getMessage());
    }
}
