package com.papermate.tag.service;

import com.papermate.paper.entity.Paper;
import com.papermate.tag.dto.TagDTO;
import com.papermate.tag.entity.PaperTag;
import com.papermate.tag.entity.Tag;
import com.papermate.tag.repository.PaperTagRepository;
import com.papermate.tag.repository.TagRepository;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    private static final Logger log = LoggerFactory.getLogger(TagService.class);

    private final TagRepository tagRepository;
    private final PaperTagRepository paperTagRepository;
    private final EntityManager entityManager;

    public TagService(TagRepository tagRepository,
                      PaperTagRepository paperTagRepository,
                      EntityManager entityManager) {
        this.tagRepository = tagRepository;
        this.paperTagRepository = paperTagRepository;
        this.entityManager = entityManager;
        backfillColors();
    }

    /** 给存量无颜色的 tag 补色 */
    private void backfillColors() {
        List<Tag> colorless = tagRepository.findByColorIsNull();
        for (Tag tag : colorless) {
            tag.setColor(hashToColor(tag.getName()));
            tagRepository.save(tag);
            log.info("Tag color backfilled: id={}, name={}, color={}", tag.getId(), tag.getName(), tag.getColor());
        }
    }

    /** Get all tags with paper count. */
    public List<TagDTO> getAllTags() {
        return tagRepository.findAll()
                .stream()
                .map(tag -> {
                    long count = paperTagRepository.findByTagId(tag.getId()).size();
                    return TagDTO.builder()
                            .id(tag.getId())
                            .name(tag.getName())
                            .color(tag.getColor())
                            .paperCount(count)
                            .build();
                })
                .toList();
    }

    /** Create a new tag. Throws if name already exists. */
    @Transactional
    public TagDTO createTag(String name) {
        if (tagRepository.existsByName(name)) {
            throw new IllegalArgumentException("标签 '" + name + "' 已存在");
        }
        String color = hashToColor(name);
        Tag tag = tagRepository.save(Tag.builder().name(name).color(color).build());
        log.info("Tag created: id={}, name={}, color={}", tag.getId(), tag.getName(), color);
        return TagDTO.builder()
                .id(tag.getId())
                .name(tag.getName())
                .color(color)
                .paperCount(0L)
                .build();
    }

    /** 根据标签名哈希生成稳定的 HSL 颜色 */
    static String hashToColor(String name) {
        int hash = 0;
        for (int i = 0; i < name.length(); i++) {
            hash = name.charAt(i) + ((hash << 5) - hash);
        }
        int hue = Math.abs(hash) % 360;
        return String.format("hsl(%d, 60%%, 90%%)", hue);
    }

    /** Delete a tag and all its paper associations. */
    @Transactional
    public void deleteTag(Long tagId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new IllegalArgumentException("标签不存在"));

        // Cascade delete all paper-tag associations
        paperTagRepository.deleteByTagId(tagId);

        tagRepository.delete(tag);
        log.info("Tag deleted: id={}, name={}", tagId, tag.getName());
    }

    /** Get all tags for a specific paper. */
    public List<TagDTO> getPaperTags(Long paperId) {
        return paperTagRepository.findByPaperId(paperId)
                .stream()
                .map(pt -> TagDTO.builder()
                        .id(pt.getTag().getId())
                        .name(pt.getTag().getName())
                        .color(pt.getTag().getColor())
                        .paperCount(null)
                        .build())
                .toList();
    }

    /** Add a tag to a paper. Idempotent — no-op if already added. */
    @Transactional
    public void addTagToPaper(Long paperId, Long tagId) {
        if (paperTagRepository.existsByPaperIdAndTagId(paperId, tagId)) {
            return; // Already tagged, idempotent
        }

        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new IllegalArgumentException("标签不存在"));

        // Use getReference to avoid loading the full Paper entity
        Paper paperRef = entityManager.getReference(Paper.class, paperId);

        PaperTag pt = PaperTag.builder()
                .paper(paperRef)
                .tag(tag)
                .build();

        paperTagRepository.save(pt);
    }

    /** Remove a tag from a paper. */
    @Transactional
    public void removeTagFromPaper(Long paperId, Long tagId) {
        if (!paperTagRepository.existsByPaperIdAndTagId(paperId, tagId)) {
            throw new IllegalArgumentException("该论文未添加此标签");
        }
        paperTagRepository.deleteByPaperIdAndTagId(paperId, tagId);
    }
}
