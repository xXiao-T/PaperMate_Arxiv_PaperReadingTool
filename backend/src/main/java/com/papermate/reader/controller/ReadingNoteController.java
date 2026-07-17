package com.papermate.reader.controller;

import com.papermate.common.Result;
import com.papermate.note.dto.AnnotationDTO;
import com.papermate.note.dto.AnnotationRequest;
import com.papermate.note.service.NoteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Compatibility adapter for the earlier frontend /notes API.
 * New code should use /annotations directly.
 */
@Deprecated
@RestController
@RequestMapping("/api/papers/{paperId}/notes")
public class ReadingNoteController {
    private final NoteService noteService;

    public ReadingNoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public Result<List<LegacyNoteVO>> getNotes(@PathVariable Long paperId) {
        List<LegacyNoteVO> notes = noteService.getAnnotations(paperId).stream()
            .filter(annotation ->
                "note".equals(annotation.getAnnotationType())
                    || "comment".equals(annotation.getAnnotationType())
            )
            .map(LegacyNoteVO::fromAnnotation)
            .toList();
        return Result.success(notes);
    }

    @PostMapping
    public Result<LegacyNoteVO> createNote(
            @PathVariable Long paperId,
            @Valid @RequestBody CreateReadingNoteRequest request) {
        AnnotationRequest annotationRequest = new AnnotationRequest();
        annotationRequest.setPageIndex(
            request.getPageNumber() == null ? 0 : request.getPageNumber() - 1
        );
        annotationRequest.setStartOffset(0);
        annotationRequest.setEndOffset(0);
        annotationRequest.setSelectedText(request.getSection());
        annotationRequest.setCommentText(request.getContent());
        annotationRequest.setAnnotationType("note");
        annotationRequest.setColor("#FFD700");
        return Result.success(
            LegacyNoteVO.fromAnnotation(
                noteService.createAnnotation(paperId, annotationRequest)
            )
        );
    }

    @DeleteMapping("/{noteId}")
    public Result<Void> deleteNote(
            @PathVariable Long paperId,
            @PathVariable Long noteId) {
        noteService.deleteAnnotation(paperId, noteId);
        return Result.success();
    }

    @Getter
    @Setter
    public static class CreateReadingNoteRequest {
        @NotBlank(message = "Note content is required")
        @Size(max = 20000, message = "Note content is too long")
        private String content;

        @Positive(message = "Page number must be positive")
        private Integer pageNumber;

        @Size(max = 2000, message = "Section is too long")
        private String section;
    }

    @Getter
    public static class LegacyNoteVO {
        private Long id;
        private String content;
        private Integer pageNumber;
        private String section;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        static LegacyNoteVO fromAnnotation(AnnotationDTO annotation) {
            LegacyNoteVO note = new LegacyNoteVO();
            note.id = annotation.getId();
            note.content = annotation.getCommentText();
            note.pageNumber = annotation.getPageIndex() + 1;
            note.section = annotation.getSelectedText();
            note.createdAt = annotation.getCreatedAt();
            note.updatedAt = annotation.getUpdatedAt();
            return note;
        }
    }
}
