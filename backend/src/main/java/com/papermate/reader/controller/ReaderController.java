package com.papermate.reader.controller;

import com.papermate.common.Result;
import com.papermate.paper.exception.PaperNotFoundException;
import com.papermate.reader.dto.ProgressDTO;
import com.papermate.reader.service.ReaderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/papers/{paperId}/progress")
public class ReaderController {
    private final ReaderService readerService;

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
            @RequestParam Integer totalPages,
            @RequestParam(defaultValue = "0") Integer readingMinutes) {
        return Result.success(
            readerService.saveProgress(paperId, currentPage, totalPages, readingMinutes)
        );
    }

    @ExceptionHandler(PaperNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handlePaperNotFound(PaperNotFoundException exception) {
        return Result.notFound(exception.getMessage());
    }
}
