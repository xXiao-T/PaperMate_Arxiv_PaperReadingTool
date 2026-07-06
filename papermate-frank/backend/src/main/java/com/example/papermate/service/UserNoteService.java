package com.example.papermate.service;

import com.example.papermate.dto.UserNoteDTO;
import com.example.papermate.entity.Paper;
import com.example.papermate.entity.UserNote;
import com.example.papermate.repository.PaperRepository;
import com.example.papermate.repository.UserNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserNoteService {
    
    private final UserNoteRepository userNoteRepository;
    private final PaperRepository paperRepository;
    
    public UserNoteService(UserNoteRepository userNoteRepository, PaperRepository paperRepository) {
        this.userNoteRepository = userNoteRepository;
        this.paperRepository = paperRepository;
    }
    
    @Transactional
    public UserNoteDTO createNote(Long paperId, Long userId, String content, String noteType) {
        System.out.println("Creating note for paper " + paperId + " by user " + userId);
        
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        UserNote note = new UserNote();
        note.setContent(content);
        note.setNoteType(noteType);
        note.setPaper(paper);
        note.setUserId(userId);
        
        note = userNoteRepository.save(note);
        return convertToDTO(note);
    }
    
    public List<UserNoteDTO> getNotesByPaperId(Long paperId) {
        return userNoteRepository.findByPaperId(paperId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserNoteDTO> getNotesByUserId(Long userId) {
        return userNoteRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserNoteDTO> getNotesByPaperIdAndUserId(Long paperId, Long userId) {
        return userNoteRepository.findByPaperIdAndUserId(paperId, userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public UserNoteDTO updateNote(Long noteId, String content) {
        UserNote note = userNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        note.setContent(content);
        note = userNoteRepository.save(note);
        
        return convertToDTO(note);
    }
    
    @Transactional
    public void deleteNote(Long noteId) {
        userNoteRepository.deleteById(noteId);
    }
    
    private UserNoteDTO convertToDTO(UserNote note) {
        UserNoteDTO dto = new UserNoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setNoteType(note.getNoteType());
        dto.setPaperId(note.getPaper().getId());
        dto.setUserId(note.getUserId());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}