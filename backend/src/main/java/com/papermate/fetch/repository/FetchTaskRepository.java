package com.papermate.fetch.repository;

import com.papermate.fetch.entity.FetchTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FetchTaskRepository extends JpaRepository<FetchTask, Long> {

    /** 按用户查询所有任务，按创建时间倒序 */
    List<FetchTask> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** 按状态筛选（调度器用来查 active 任务） */
    List<FetchTask> findByStatus(String status);

    /** 查状态为 active 且已到达执行时间的任务（调度器核心方法） */
    List<FetchTask> findByStatusAndNextRunAtBefore(String status, LocalDateTime now);
}
