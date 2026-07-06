package com.example.papermate.controller;

import com.example.papermate.dto.PaperDTO;
import com.example.papermate.service.PaperAnalysisService;
import com.example.papermate.service.PaperService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/papers")
public class PaperController {
    
    private final PaperService paperService;
    private final PaperAnalysisService paperAnalysisService;
    
    public PaperController(PaperService paperService, PaperAnalysisService paperAnalysisService) {
        this.paperService = paperService;
        this.paperAnalysisService = paperAnalysisService;
    }
    
    @GetMapping
    public ResponseEntity<List<PaperDTO>> getAllPapers() {
        return ResponseEntity.ok(paperService.findAll());
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<PaperDTO>> getRecentPapers() {
        return ResponseEntity.ok(paperService.getRecentPapers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaperDTO> getPaperById(@PathVariable Long id) {
        return paperService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/arxiv/{arxivId}")
    public ResponseEntity<PaperDTO> getPaperByArxivId(@PathVariable String arxivId) {
        return paperService.findByArxivId(arxivId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<PaperDTO>> getPapersByCategory(@PathVariable String category) {
        return ResponseEntity.ok(paperService.findByCategory(category));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(paperService.getAllCategories());
    }
    
    @PostMapping("/fetch")
    public ResponseEntity<PaperDTO> fetchPaper(@RequestBody Map<String, String> request) {
        String arxivId = request.get("arxivId");
        if (arxivId == null || arxivId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        PaperDTO paper = paperService.fetchAndSavePaper(arxivId);
        return ResponseEntity.ok(paper);
    }
    
    @PostMapping("/batch-fetch")
    public ResponseEntity<List<PaperDTO>> batchFetchPapers(@RequestBody Map<String, List<String>> request) {
        List<String> arxivIds = request.get("arxivIds");
        if (arxivIds == null || arxivIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<PaperDTO> papers = arxivIds.stream()
                .map(paperService::fetchAndSavePaper)
                .toList();
        
        return ResponseEntity.ok(papers);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PaperDTO> updatePaper(@PathVariable Long id, @RequestBody PaperDTO dto) {
        return ResponseEntity.ok(paperService.update(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaper(@PathVariable Long id) {
        paperService.delete(id);
        return ResponseEntity.noContent().build();
    }
}