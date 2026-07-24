package com.papermate.search.controller;

import com.papermate.common.Result;
import com.papermate.search.service.ArxivSearchService;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/arxiv")
public class ArxivSearchController {
    private final ArxivSearchService arxivSearchService;
    public ArxivSearchController(ArxivSearchService arxivSearchService) { this.arxivSearchService = arxivSearchService; }

    @GetMapping("/debug")
    public Result<String> debug(@RequestParam String keyword, @RequestParam(defaultValue = "all") String searchType,
            @RequestParam(defaultValue = "30") int maxResults, @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "descending") String sortOrder) {
        return Result.success(arxivSearchService.buildDebugUrl(keyword, searchType, maxResults, sortBy, sortOrder));
    }

    @GetMapping("/search")
    public Result<Map<String, Object>> search(@RequestParam String keyword, @RequestParam(defaultValue = "all") String searchType,
            @RequestParam(defaultValue = "30") int maxResults, @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "descending") String sortOrder, @RequestParam(required = false) String category) {
        List<ArxivSearchService.ArxivResult> papers = arxivSearchService.search(keyword, searchType, maxResults, sortBy, sortOrder, category);
        List<Map<String, Object>> list = papers.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.arxivId()); m.put("title", p.title()); m.put("authors", p.authors());
            m.put("paperAbstract", p.summary());
            m.put("publishedAt", p.publishedAt() != null ? p.publishedAt().toString() : null);
            m.put("arxivUrl", p.arxivUrl()); m.put("category", p.category());
            m.put("tags", p.category() != null ? List.of(p.category()) : List.of());
            m.put("favorited", false); m.put("starred", false);
            return m;
        }).toList();
        Map<String, Object> result = new HashMap<>(); result.put("list", list); result.put("total", list.size());
        return Result.success(result);
    }
}