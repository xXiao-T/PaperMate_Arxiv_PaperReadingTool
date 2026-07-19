package com.papermate.library.service;

import com.papermate.library.entity.UserPaper;
import com.papermate.library.repository.UserPaperRepository;
import com.papermate.paper.service.PaperStatusProvider;
import com.papermate.paper.service.PaperUserStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class LibraryPaperStatusProvider implements PaperStatusProvider {
    private final UserPaperRepository userPaperRepository;

    public LibraryPaperStatusProvider(UserPaperRepository userPaperRepository) {
        this.userPaperRepository = userPaperRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, PaperUserStatus> findStatuses(Long userId, Collection<Long> paperIds) {
        if (paperIds == null || paperIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Long> ids = paperIds.stream().distinct().toList();
        return userPaperRepository.findByUserIdAndPaperIdIn(userId, ids).stream()
            .collect(Collectors.toMap(
                UserPaper::getPaperId,
                relation -> new PaperUserStatus(
                    Boolean.TRUE.equals(relation.getFavorited()),
                    Boolean.TRUE.equals(relation.getStarred())
                ),
                (first, ignored) -> first
            ));
    }

    @Override
    @Transactional
    public void ensureLinked(Long userId, Long paperId) {
        if (userPaperRepository.findByUserIdAndPaperId(userId, paperId).isEmpty()) {
            UserPaper up = UserPaper.builder()
                .userId(userId)
                .paperId(paperId)
                .favorited(true)
                .starred(false)
                .build();
            userPaperRepository.save(up);
        }
    }
}
