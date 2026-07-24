package com.papermate.search.history;
import com.papermate.common.utils.SecurityUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
@Service
public class SearchHistoryService {
    private final SearchHistoryRepository repo;
    private final SecurityUtil securityUtil;
    public SearchHistoryService(SearchHistoryRepository repo, SecurityUtil securityUtil) { this.repo = repo; this.securityUtil = securityUtil; }
    public List<Map<String, String>> getHistory() {
        Long userId = securityUtil.getCurrentUserId();
        return repo.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 20)).stream()
                .map(h -> Map.of("query", h.getQuery(), "searchType", h.getSearchType() != null ? h.getSearchType() : "all")).toList();
    }
    @Transactional public void save(String query, String searchType) {
        Long userId = securityUtil.getCurrentUserId();
        repo.deleteByUserIdAndQuery(userId, query);
        repo.save(new SearchHistory(userId, query, searchType));
    }
    @Transactional public void clear() { repo.deleteByUserId(securityUtil.getCurrentUserId()); }
}