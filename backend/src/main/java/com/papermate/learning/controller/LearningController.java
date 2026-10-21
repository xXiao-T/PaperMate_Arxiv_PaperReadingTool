package com.papermate.learning.controller;

import com.papermate.common.Result;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.learning.dto.KnowledgeGraphVO;
import com.papermate.learning.dto.LearningStatsVO;
import com.papermate.learning.service.LearningService;
import com.papermate.library.dto.LibraryPaperVO;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/learning")
public class LearningController {
    private final LearningService learningService;
    private final SecurityUtil securityUtil;

    public LearningController(LearningService learningService, SecurityUtil securityUtil) {
        this.learningService = learningService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/stats")
    public Result<LearningStatsVO> getStats() {
        return Result.success(learningService.getStats(currentUserId()));
    }

    @GetMapping("/records")
    public Result<List<LibraryPaperVO>> getRecords(
            @RequestParam(defaultValue = "all") String period) {
        return Result.success(
            learningService.getRecords(currentUserId(), period)
        );
    }

    @PostMapping("/knowledge-graph")
    public Result<KnowledgeGraphVO> generateKnowledgeGraph(
            @RequestParam(defaultValue = "all") String period) {
        return Result.success(
            learningService.generateKnowledgeGraph(currentUserId(), period)
        );
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
