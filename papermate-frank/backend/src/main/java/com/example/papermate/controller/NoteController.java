package com.example.papermate.controller;

import com.example.papermate.dto.UserNoteDTO;
import com.example.papermate.service.UserNoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notes")
public class NoteController {
    
    private final UserNoteService userNoteService;
    
    public NoteController(UserNoteService userNoteService) {
        this.userNoteService = userNoteService;
    }
    
    @PostMapping
    public ResponseEntity<UserNoteDTO> createNote(@RequestBody Map<String, Object> request) {
        Long paperId = Long.valueOf(request.get("paperId").toString());
        Long userId = request.get("userId") != null ? 
                Long.valueOf(request.get("userId").toString()) : 1L;
        String content = request.get("content").toString();
        String noteType = request.get("noteType") != null ? 
                request.get("noteType").toString() : "note";
        
        return ResponseEntity.ok(userNoteService.createNote(paperId, userId, content, noteType));
    }
    
    @GetMapping("/paper/{paperId}")
    public ResponseEntity<List<UserNoteDTO>> getNotesByPaperId(@PathVariable Long paperId) {
        return ResponseEntity.ok(userNoteService.getNotesByPaperId(paperId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNoteDTO>> getNotesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userNoteService.getNotesByUserId(userId));
    }
    
    @GetMapping("/paper/{paperId}/user/{userId}")
    public ResponseEntity<List<UserNoteDTO>> getNotesByPaperIdAndUserId(
            @PathVariable Long paperId, 
            @PathVariable Long userId) {
        return ResponseEntity.ok(userNoteService.getNotesByPaperIdAndUserId(paperId, userId));
    }
    
    @PutMapping("/{noteId}")
    public ResponseEntity<UserNoteDTO> updateNote(
            @PathVariable Long noteId, 
            @RequestBody Map<String, String> request) {
        String content = request.get("content");
        return ResponseEntity.ok(userNoteService.updateNote(noteId, content));
    }
    
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId) {
        userNoteService.deleteNote(noteId);
        return ResponseEntity.noContent().build();
    }
}