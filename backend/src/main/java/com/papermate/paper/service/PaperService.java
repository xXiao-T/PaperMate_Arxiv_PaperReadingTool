package com.papermate.paper.service;

import com.papermate.common.utils.SecurityUtil;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.dto.PaperDetailVO;
import com.papermate.paper.dto.PaperImportRequest;
import com.papermate.paper.dto.PaperPageVO;
import com.papermate.paper.entity.Paper;
import com.papermate.paper.exception.PaperNotFoundException;
import com.papermate.paper.repository.PaperRepository;
import com.papermate.paper.specification.PaperSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PaperService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Pattern ARXIV_URL_PATTERN = Pattern.compile(
        "(?i)^https?://(?:www\\.)?arxiv\\.org/(?:abs|pdf)/([^?#]+)"
    );
    private static final Pattern ARXIV_VERSION_PATTERN = Pattern.compile(
        "v\\d+$",
        Pattern.CASE_INSENSITIVE
    );

    private final PaperRepository paperRepository;
    private final PaperStatusProvider paperStatusProvider;
    private final SecurityUtil securityUtil;

    public PaperService(
            PaperRepository paperRepository,
            PaperStatusProvider paperStatusProvider,
            SecurityUtil securityUtil) {
        this.paperRepository = paperRepository;
        this.paperStatusProvider = paperStatusProvider;
        this.securityUtil = securityUtil;
    }

    @Transactional(readOnly = true)
    public PaperPageVO search(String keyword, String tag, int page, int pageSize) {
        validatePageRequest(page, pageSize);
        Page<Paper> paperPage = paperRepository.findAll(
            PaperSpecification.searchBy(keyword, tag),
            PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        Map<Long, PaperUserStatus> statuses = loadCurrentUserStatuses(paperPage.getContent());
        List<PaperDTO> papers = paperPage.getContent().stream()
            .map(paper -> PaperDTO.fromEntity(
                paper,
                statuses.getOrDefault(paper.getId(), PaperUserStatus.NONE).favorited(),
                statuses.getOrDefault(paper.getId(), PaperUserStatus.NONE).starred()
            ))
            .toList();
        return new PaperPageVO(papers, paperPage.getTotalElements(), page, pageSize);
    }

    @Transactional(readOnly = true)
    public PaperDetailVO getById(Long paperId) {
        Paper paper = requirePaper(paperId);
        PaperUserStatus status = loadCurrentUserStatuses(List.of(paper))
            .getOrDefault(paperId, PaperUserStatus.NONE);
        return PaperDetailVO.fromEntity(paper, status.favorited(), status.starred());
    }

    @Transactional(readOnly = true)
    public PaperDTO getSummaryById(Long paperId) {
        return PaperDTO.fromEntity(requirePaper(paperId), false, false);
    }

    @Transactional(readOnly = true)
    public Map<Long, PaperDTO> getSummariesByIds(Collection<Long> paperIds) {
        if (paperIds == null || paperIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Long, PaperDTO> papers = new LinkedHashMap<>();
        paperRepository.findAllById(paperIds).forEach(paper ->
            papers.put(paper.getId(), PaperDTO.fromEntity(paper, false, false))
        );
        return papers;
    }

    @Transactional(readOnly = true)
    public void requireExists(Long paperId) {
        if (!paperRepository.existsById(paperId)) {
            throw new PaperNotFoundException(paperId);
        }
    }

    @Transactional
    public PaperDTO importPaper(PaperImportRequest request) {
        String arxivUrl = normalizeNullable(request.getArxivUrl());
        String arxivId = extractArxivId(arxivUrl);
        Optional<Paper> existingPaper = findExistingPaper(arxivId, arxivUrl);
        boolean linked = false;
        Paper paper;
        if (existingPaper.isPresent()) {
            paper = existingPaper.get();
        } else {
            paper = Paper.builder()
                .arxivId(arxivId)
                .source(arxivId == null ? "manual" : "arxiv")
                .sourceId(arxivId)
                .title(request.getTitle().trim())
                .authors(request.getAuthors().trim())
                .paperAbstract(normalizeNullable(request.getPaperAbstract()))
                .category(normalizeNullable(request.getCategory()))
                .publishedAt(request.getPublishedAt())
                .arxivUrl(arxivUrl)
                .tags(normalizeNullable(request.getTags()))
                .build();
            paper = paperRepository.save(paper);
        }
        // 将论文关联到当前用户（收藏），刷页不丢失
        try {
            Long userId = securityUtil.getCurrentUserId();
            paperStatusProvider.ensureLinked(userId, paper.getId());
            linked = true;
        } catch (Exception ignored) {
            // 未登录时不关联
        }
        return PaperDTO.fromEntity(paper, linked, false);
    }

    @Transactional
    public void updateTags(Long paperId, String tags) {
        Paper paper = requirePaper(paperId);
        paper.setTags(normalizeNullable(tags));
        paperRepository.save(paper);
    }

    @Transactional
    public void updatePdfPath(Long paperId, String pdfPath) {
        Paper paper = requirePaper(paperId);
        paper.setPdfPath(pdfPath);
        paperRepository.save(paper);
    }

    private Paper requirePaper(Long paperId) {
        return paperRepository.findById(paperId)
            .orElseThrow(() -> new PaperNotFoundException(paperId));
    }

    private Optional<Paper> findExistingPaper(String arxivId, String arxivUrl) {
        if (arxivId != null) {
            Optional<Paper> byArxivId = paperRepository.findByArxivId(arxivId);
            if (byArxivId.isPresent()) {
                return byArxivId;
            }
        }
        return arxivUrl == null ? Optional.empty() : paperRepository.findByArxivUrl(arxivUrl);
    }

    private Map<Long, PaperUserStatus> loadCurrentUserStatuses(Collection<Paper> papers) {
        if (papers.isEmpty()) {
            return Collections.emptyMap();
        }
        return securityUtil.getCurrentUser()
            .map(user -> paperStatusProvider.findStatuses(
                user.getId(),
                papers.stream().map(Paper::getId).toList()
            ))
            .orElseGet(Collections::emptyMap);
    }

    private static String extractArxivId(String arxivUrl) {
        if (arxivUrl == null) {
            return null;
        }
        Matcher matcher = ARXIV_URL_PATTERN.matcher(arxivUrl);
        if (!matcher.find()) {
            return null;
        }
        String arxivId = matcher.group(1);
        if (arxivId.toLowerCase().endsWith(".pdf")) {
            arxivId = arxivId.substring(0, arxivId.length() - 4);
        }
        return ARXIV_VERSION_PATTERN.matcher(arxivId).replaceFirst("");
    }

    private static String normalizeNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static void validatePageRequest(int page, int pageSize) {
        if (page < 0) {
            throw new IllegalArgumentException("Page must be zero or greater");
        }
        if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                "Page size must be between 1 and " + MAX_PAGE_SIZE
            );
        }
    }
}
