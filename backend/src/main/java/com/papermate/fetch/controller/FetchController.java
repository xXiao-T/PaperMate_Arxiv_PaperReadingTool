package com.papermate.fetch.controller;

import com.papermate.auth.entity.User;
import com.papermate.common.Result;
import com.papermate.fetch.dto.CreateFetchTaskRequest;
import com.papermate.fetch.dto.FetchTaskDTO;
import com.papermate.fetch.service.FetchService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 抓取任务 REST 控制器。
 *
 * <p>6 个端点，全部需要 JWT 认证（由 {@code SecurityConfig} 统一拦截）。
 * 设计对齐 {@code backend/backend实现指南.md} §3.9。</p>
 */
@RestController
@RequestMapping("/api/fetch/tasks")
public class FetchController {

    private static final Logger log = LoggerFactory.getLogger(FetchController.class);

    private final FetchService fetchService;

    public FetchController(FetchService fetchService) {
        this.fetchService = fetchService;
    }

    /** GET /api/fetch/tasks — 获取当前用户的所有抓取任务 */
    @GetMapping
    public Result<List<FetchTaskDTO>> listTasks() {
        Long userId = getCurrentUserId();
        return Result.success(fetchService.getTasks(userId));
    }

    /** POST /api/fetch/tasks — 创建抓取任务 */
    @PostMapping
    public Result<FetchTaskDTO> createTask(@Valid @RequestBody CreateFetchTaskRequest request) {
        Long userId = getCurrentUserId();
        try {
            FetchTaskDTO dto = fetchService.createTask(request, userId);
            return Result.success(dto);
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        }
    }

    /** PUT /api/fetch/tasks/{id} — 编辑抓取任务 */
    @PutMapping("/{id}")
    public Result<FetchTaskDTO> updateTask(@PathVariable Long id,
                                           @Valid @RequestBody CreateFetchTaskRequest request) {
        Long userId = getCurrentUserId();
        try {
            FetchTaskDTO dto = fetchService.updateTask(id, request, userId);
            return Result.success(dto);
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        } catch (SecurityException e) {
            return Result.forbidden(e.getMessage());
        }
    }

    /** DELETE /api/fetch/tasks/{id} — 删除抓取任务 */
    @DeleteMapping("/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            fetchService.deleteTask(id, userId);
            return Result.success();
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        } catch (SecurityException e) {
            return Result.forbidden(e.getMessage());
        }
    }

    /** POST /api/fetch/tasks/{id}/run — 立即执行一次 */
    @PostMapping("/{id}/run")
    public Result<Map<String, String>> runTaskNow(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            fetchService.runTaskNow(id, userId);
            return Result.success(Map.of("status", "triggered"));
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        } catch (SecurityException e) {
            return Result.forbidden(e.getMessage());
        }
    }

    /** PUT /api/fetch/tasks/{id}/status — 切换 active/paused */
    @PutMapping("/{id}/status")
    public Result<FetchTaskDTO> toggleStatus(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            FetchTaskDTO dto = fetchService.toggleStatus(id, userId);
            return Result.success(dto);
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        } catch (SecurityException e) {
            return Result.forbidden(e.getMessage());
        }
    }

    // ─── 工具方法 ────────────────────────────────────────────────

    /**
     * 从 SecurityContext 提取当前用户 ID。
     * principal 为 {@link User} 或 {@link Long}（兼容历史设定）。
     */
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
