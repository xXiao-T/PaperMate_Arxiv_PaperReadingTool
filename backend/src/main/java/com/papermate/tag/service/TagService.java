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
        Tag tag = tagRepository.save(Tag.builder().name(name).build());
        log.info("Tag created: id={}, name={}", tag.getId(), tag.getName());
        return TagDTO.builder()
                .id(tag.getId())
                .name(tag.getName())
                .paperCount(0L)
                .build();
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
                        .paperCount(null) // Not needed for per-paper view
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
