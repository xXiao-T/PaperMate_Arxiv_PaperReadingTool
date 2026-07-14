package com.papermate.fetch.repository;

import com.papermate.fetch.entity.FetchTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FetchTaskRepository extends JpaRepository<FetchTask, Long> {

    List<FetchTask> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FetchTask> findByIsActiveTrue();
}
