package com.papermate.reader.controller;

import com.papermate.common.Result;
import com.papermate.reader.dto.ProgressDTO;
import com.papermate.reader.service.ReaderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/papers/{paperId}/progress")
public class ReaderController {

    private final ReaderService readerService;

    // 手动构造器（替代 @RequiredArgsConstructor）
    public ReaderController(ReaderService readerService) {
        this.readerService = readerService;
    }

    @GetMapping
    public Result<ProgressDTO> getProgress(@PathVariable Long paperId) {
        return Result.success(readerService.getProgress(paperId));
    }

    @PostMapping
    public Result<ProgressDTO> saveProgress(
            @PathVariable Long paperId,
            @RequestParam Integer currentPage,
            @RequestParam Integer totalPages) {
        return Result.success(readerService.saveProgress(paperId, currentPage, totalPages));
    }
}