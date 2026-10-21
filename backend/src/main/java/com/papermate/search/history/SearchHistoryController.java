package com.papermate.search.history;
import com.papermate.common.Result;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/search/history")
public class SearchHistoryController {
    private final SearchHistoryService service;
    public SearchHistoryController(SearchHistoryService service) { this.service = service; }
    @GetMapping public Result<List<Map<String, String>>> getHistory() { return Result.success(service.getHistory()); }
    @PostMapping public Result<Void> save(@RequestBody Map<String, String> body) {
        String query = body.get("query");
        if (query != null && !query.isBlank()) { service.save(query.trim(), body.getOrDefault("searchType", "all")); }
        return Result.success(null);
    }
    @DeleteMapping public Result<Void> clear() { service.clear(); return Result.success(null); }
}