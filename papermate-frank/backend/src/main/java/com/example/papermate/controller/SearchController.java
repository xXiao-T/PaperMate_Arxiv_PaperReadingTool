package com.example.papermate.controller;

import com.example.papermate.dto.PaperDTO;
import com.example.papermate.dto.SearchRequestDTO;
import com.example.papermate.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {
    
    private final SearchService searchService;
    
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }
    
    @PostMapping
    public ResponseEntity<List<PaperDTO>> search(@RequestBody SearchRequestDTO request) {
        return ResponseEntity.ok(searchService.search(request));
    }
    
    @GetMapping("/keyword")
    public ResponseEntity<List<PaperDTO>> searchByKeyword(@RequestParam String keyword) {
        return ResponseEntity.ok(searchService.searchByKeyword(keyword));
    }
    
    @GetMapping("/author")
    public ResponseEntity<List<PaperDTO>> searchByAuthor(@RequestParam String author) {
        return ResponseEntity.ok(searchService.searchByAuthor(author));
    }
    
    @GetMapping("/category")
    public ResponseEntity<List<PaperDTO>> searchByCategory(@RequestParam String category) {
        return ResponseEntity.ok(searchService.searchByCategory(category));
    }
    
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String keyword) {
        return ResponseEntity.ok(searchService.getSuggestions(keyword));
    }
}