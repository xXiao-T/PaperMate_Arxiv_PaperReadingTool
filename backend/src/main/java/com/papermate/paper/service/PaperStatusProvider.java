package com.papermate.paper.service;

import java.util.Collection;
import java.util.Map;

public interface PaperStatusProvider {
    Map<Long, PaperUserStatus> findStatuses(Long userId, Collection<Long> paperIds);
}
