package com.example.papermate.controller;

import com.example.papermate.dto.ConceptDTO;
import com.example.papermate.service.PaperAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analysis")
public class AnalysisController {
    
    private final PaperAnalysisService paperAnalysisService;
    
    public AnalysisController(PaperAnalysisService paperAnalysisService) {
        this.paperAnalysisService = paperAnalysisService;
    }
    
    @PostMapping("/{paperId}")
    public ResponseEntity<Void> analyzePaper(@PathVariable Long paperId) {
        paperAnalysisService.analyzePaper(paperId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/concepts/{paperId}")
    public ResponseEntity<List<ConceptDTO>> getConceptsByPaperId(@PathVariable Long paperId) {
        return ResponseEntity.ok(paperAnalysisService.getConceptsByPaperId(paperId));
    }
    
    @GetMapping("/concepts/search")
    public ResponseEntity<List<ConceptDTO>> searchConcepts(@RequestParam String keyword) {
        return ResponseEntity.ok(paperAnalysisService.searchConcepts(keyword));
    }
}