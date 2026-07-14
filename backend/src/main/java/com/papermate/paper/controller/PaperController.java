package com.papermate.paper.controller;

import com.papermate.auth.entity.User;
import com.papermate.common.Result;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.dto.PaperDetailVO;
import com.papermate.paper.dto.PaperImportRequest;
import com.papermate.paper.service.PaperService;
import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/papers")
public class PaperController {
    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public Result<Map<String, Object>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = getCurrentUserId();
        return Result.success(paperService.search(keyword, tag, page, pageSize, userId));
    }

    @GetMapping("/{id}")
    public Result<PaperDetailVO> getById(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return Result.success(paperService.getById(id, userId));
    }

    @PostMapping
    public Result<PaperDTO> importPaper(@Valid @RequestBody PaperImportRequest request) {
        Long userId = getCurrentUserId();
        return Result.success(paperService.importPaper(request, userId));
    }

    private Long getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        if (auth.getPrincipal() instanceof User user) {
            return user.getId();
        }
        if (auth.getPrincipal() instanceof Long id) {
            return id;
        }
        return null;
    }
}
