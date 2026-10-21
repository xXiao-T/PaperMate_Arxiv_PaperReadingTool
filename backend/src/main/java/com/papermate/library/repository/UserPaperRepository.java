package com.papermate.library.repository;

import com.papermate.library.entity.UserPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPaperRepository extends JpaRepository<UserPaper, Long> {
    List<UserPaper> findByUserId(Long userId);

    Optional<UserPaper> findByUserIdAndPaperId(Long userId, Long paperId);

    List<UserPaper> findByUserIdAndPaperIdIn(Long userId, List<Long> paperIds);

    List<UserPaper> findByUserIdAndFavoritedTrueOrderByImportedAtDesc(Long userId);

    List<UserPaper> findByUserIdOrderByImportedAtDesc(Long userId);
}
