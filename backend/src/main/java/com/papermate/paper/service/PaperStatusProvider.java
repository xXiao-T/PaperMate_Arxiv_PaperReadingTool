package com.papermate.paper.service;

import java.util.Collection;
import java.util.Map;

public interface PaperStatusProvider {
    Map<Long, PaperUserStatus> findStatuses(Long userId, Collection<Long> paperIds);

    /** 确保论文已关联到用户（收藏），幂等 */
    void ensureLinked(Long userId, Long paperId);
}
