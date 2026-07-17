import { apiFetch } from './request';

// ─── 阅读进度 API ────────────────────────────────────────────────

export function getProgress(paperId) {
    return apiFetch(`/api/papers/${paperId}/progress`);
}

export function saveProgress(paperId, currentPage, totalPages) {
    return apiFetch(`/api/papers/${paperId}/progress?currentPage=${currentPage}&totalPages=${totalPages}`, {
        method: 'POST',
    });
}