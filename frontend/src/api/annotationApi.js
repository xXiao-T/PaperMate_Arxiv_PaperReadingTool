import { apiFetch } from './request';

// ─── 批注 API ─────────────────────────────────────────────────────

export function getAnnotations(paperId) {
    return apiFetch(`/api/papers/${paperId}/annotations`);
}

export function createAnnotation(paperId, data) {
    return apiFetch(`/api/papers/${paperId}/annotations`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateAnnotation(paperId, annotationId, data) {
    return apiFetch(`/api/papers/${paperId}/annotations/${annotationId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function deleteAnnotation(paperId, annotationId) {
    return apiFetch(`/api/papers/${paperId}/annotations/${annotationId}`, {
        method: 'DELETE',
    });
}