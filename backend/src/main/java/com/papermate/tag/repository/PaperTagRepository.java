package com.papermate.tag.repository;

import com.papermate.tag.entity.PaperTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperTagRepository extends JpaRepository<PaperTag, Long> {

    List<PaperTag> findByPaperId(Long paperId);

    List<PaperTag> findByTagId(Long tagId);

    void deleteByPaperIdAndTagId(Long paperId, Long tagId);

    boolean existsByPaperIdAndTagId(Long paperId, Long tagId);

    void deleteByTagId(Long tagId);
}
