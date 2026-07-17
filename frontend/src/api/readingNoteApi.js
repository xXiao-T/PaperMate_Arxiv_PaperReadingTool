import { apiFetch } from './request';

// ─── 阅读笔记 API ─────────────────────────────────────────────────

export function getReadingNotes(paperId) {
    return apiFetch(`/api/papers/${paperId}/notes`);
}

export function createReadingNote(paperId, data) {
    return apiFetch(`/api/papers/${paperId}/notes`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function deleteReadingNote(paperId, noteId) {
    return apiFetch(`/api/papers/${paperId}/notes/${noteId}`, {
        method: 'DELETE',
    });
}