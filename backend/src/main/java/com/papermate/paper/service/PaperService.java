package com.papermate.paper.service;

import com.papermate.library.entity.UserPaper;
import com.papermate.library.repository.UserPaperRepository;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.dto.PaperDetailVO;
import com.papermate.paper.dto.PaperImportRequest;
import com.papermate.paper.entity.Paper;
import com.papermate.paper.repository.PaperRepository;
import com.papermate.paper.specification.PaperSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaperService {
    private final PaperRepository paperRepository;
    private final UserPaperRepository userPaperRepository;

    public PaperService(PaperRepository paperRepository, UserPaperRepository userPaperRepository) {
        this.paperRepository = paperRepository;
        this.userPaperRepository = userPaperRepository;
    }

    public Map<String, Object> search(String keyword, String tag, int page, int pageSize, Long userId) {
        Page<Paper> paperPage = paperRepository.findAll(
            PaperSpecification.searchBy(keyword, tag),
            PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<Long> paperIds = paperPage.getContent().stream()
            .map(Paper::getId).collect(Collectors.toList());
        Map<Long, UserPaper> userPaperMap = Collections.emptyMap();
        if (userId != null && !paperIds.isEmpty()) {
            userPaperMap = userPaperRepository.findByUserIdAndPaperIdIn(userId, paperIds)
                .stream().collect(Collectors.toMap(UserPaper::getPaperId, up -> up, (a, b) -> a));
        }

        Map<Long, UserPaper> finalMap = userPaperMap;
        List<PaperDTO> dtos = paperPage.getContent().stream().map(paper -> {
            UserPaper up = finalMap.get(paper.getId());
            return PaperDTO.fromEntity(paper,
                up != null ? up.getFavorited() : false,
                up != null ? up.getStarred() : false);
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", dtos);
        result.put("total", paperPage.getTotalElements());
        result.put("page", page);
        result.put("pageSize", pageSize);
        return result;
    }

    public PaperDetailVO getById(Long paperId, Long userId) {
        Paper paper = paperRepository.findById(paperId)
            .orElseThrow(() -> new IllegalArgumentException("Paper not found"));

        UserPaper up = null;
        if (userId != null) {
            up = userPaperRepository.findByUserIdAndPaperId(userId, paperId).orElse(null);
        }
        return PaperDetailVO.fromEntity(paper,
            up != null && up.getFavorited(),
            up != null && up.getStarred());
    }

    public PaperDTO importPaper(PaperImportRequest request, Long userId) {
        Paper paper = new Paper();
        paper.setTitle(request.getTitle());
        paper.setAuthors(request.getAuthors());
        paper.setPaperAbstract(request.getPaperAbstract());
        paper.setCategory(request.getCategory());
        paper.setPublishedAt(request.getPublishedAt());
        paper.setArxivUrl(request.getArxivUrl());
        paper.setTags(request.getTags());
        paperRepository.save(paper);

        if (userId != null) {
            UserPaper up = new UserPaper();
            up.setUserId(userId);
            up.setPaperId(paper.getId());
            up.setFavorited(true);
            up.setStarred(false);
            up.setImportedAt(LocalDateTime.now());
            userPaperRepository.save(up);
        }

        return PaperDTO.fromEntity(paper, userId != null, false);
    }
}
