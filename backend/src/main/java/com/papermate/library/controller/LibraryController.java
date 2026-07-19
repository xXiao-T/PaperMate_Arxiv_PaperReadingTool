package com.papermate.library.controller;

import com.papermate.common.Result;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.library.dto.LibraryPaperRequest;
import com.papermate.library.dto.LibraryPaperVO;
import com.papermate.library.service.LibraryService;
import com.papermate.paper.exception.PaperNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {
    private final LibraryService libraryService;
    private final SecurityUtil securityUtil;

    public LibraryController(LibraryService libraryService, SecurityUtil securityUtil) {
        this.libraryService = libraryService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/favorites")
    public Result<List<LibraryPaperVO>> getFavorites() {
        return Result.success(libraryService.getFavorites(currentUserId()));
    }

    @PostMapping("/favorites")
    public Result<LibraryPaperVO> addFavorite(
            @Valid @RequestBody LibraryPaperRequest request) {
        return Result.success(
            libraryService.addFavorite(currentUserId(), request.getPaperId())
        );
    }

    @DeleteMapping("/favorites/{paperId}")
    public Result<Void> removeFavorite(@PathVariable Long paperId) {
        libraryService.removeFavorite(currentUserId(), paperId);
        return Result.success();
    }

    @PostMapping("/stars")
    public Result<LibraryPaperVO> toggleStar(
            @Valid @RequestBody LibraryPaperRequest request) {
        return Result.success(
            libraryService.toggleStar(currentUserId(), request.getPaperId())
        );
    }

    @ExceptionHandler(PaperNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handlePaperNotFound(PaperNotFoundException exception) {
        return Result.notFound(exception.getMessage());
    }

    private Long currentUserId() {
        try {
            return securityUtil.getCurrentUserId();
        } catch (IllegalStateException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                "User is not authenticated"
            );
        }
    }
}
