package com.papermate.note.controller;

import com.papermate.common.Result;
import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;
import com.papermate.note.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/papers/{paperId}/annotations")
public class NoteController {

    private final NoteService noteService;

    // 手动构造器（替代 @RequiredArgsConstructor）
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
        return Result.success(noteService.updateAnnotation(annotationId, request));
    }

    @DeleteMapping("/{annotationId}")
    public Result<Void> deleteAnnotation(
            @PathVariable Long paperId,
            @PathVariable Long annotationId) {
        noteService.deleteAnnotation(annotationId);
        return Result.success();
    }
}