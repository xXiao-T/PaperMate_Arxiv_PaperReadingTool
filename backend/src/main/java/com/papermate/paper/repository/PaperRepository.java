package com.papermate.paper.repository;

import com.papermate.paper.entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long>, JpaSpecificationExecutor<Paper> {
    Optional<Paper> findByArxivId(String arxivId);

    Optional<Paper> findByArxivUrl(String arxivUrl);
}
