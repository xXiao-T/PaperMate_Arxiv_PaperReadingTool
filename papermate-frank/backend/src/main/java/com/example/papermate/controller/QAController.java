package com.example.papermate.controller;

import com.example.papermate.dto.QuestionAnswerDTO;
import com.example.papermate.dto.QARequestDTO;
import com.example.papermate.service.QAService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/qa")
public class QAController {
    
    private final QAService qaService;
    
    public QAController(QAService qaService) {
        this.qaService = qaService;
    }
    
    @PostMapping
    public ResponseEntity<QuestionAnswerDTO> askQuestion(@RequestBody QARequestDTO request) {
        return ResponseEntity.ok(qaService.askQuestion(request.getPaperId(), request.getQuestion()));
    }
    
    @GetMapping("/paper/{paperId}")
    public ResponseEntity<List<QuestionAnswerDTO>> getQAsByPaperId(@PathVariable Long paperId) {
        return ResponseEntity.ok(qaService.getQAsByPaperId(paperId));
    }
}