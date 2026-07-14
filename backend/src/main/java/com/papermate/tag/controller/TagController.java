package com.papermate.tag.controller;

import com.papermate.common.Result;
import com.papermate.tag.dto.TagDTO;
import com.papermate.tag.service.TagService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    // ─── Global tag endpoints ───────────────────────────────────────

    /** GET /api/tags — list all tags */
    @GetMapping("/tags")
    public Result<List<TagDTO>> getAllTags() {
        return Result.success(tagService.getAllTags());
    }

    /** POST /api/tags — create a new tag */
    @PostMapping("/tags")
    @ResponseStatus(HttpStatus.CREATED)
    public Result<TagDTO> createTag(@RequestParam String name) {
        return Result.success(tagService.createTag(name));
    }

    /** DELETE /api/tags/{id} — delete a tag */
    @DeleteMapping("/tags/{id}")
    public Result<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return Result.success();
    }

    // ─── Per-paper tag endpoints ────────────────────────────────────

    /** GET /api/papers/{paperId}/tags — get tags for a paper */
    @GetMapping("/papers/{paperId}/tags")
    public Result<List<TagDTO>> getPaperTags(@PathVariable Long paperId) {
        return Result.success(tagService.getPaperTags(paperId));
    }

    /** POST /api/papers/{paperId}/tags — add a tag to a paper */
    @PostMapping("/papers/{paperId}/tags")
    public Result<Void> addTagToPaper(@PathVariable Long paperId, @RequestParam Long tagId) {
        tagService.addTagToPaper(paperId, tagId);
        return Result.success();
    }

    /** DELETE /api/papers/{paperId}/tags/{tagId} — remove a tag from a paper */
    @DeleteMapping("/papers/{paperId}/tags/{tagId}")
    public Result<Void> removeTagFromPaper(@PathVariable Long paperId, @PathVariable Long tagId) {
        tagService.removeTagFromPaper(paperId, tagId);
        return Result.success();
    }
}
