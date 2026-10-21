import { apiFetch } from './request';

export function getComments(paperId) {
  return apiFetch(`/api/papers/${paperId}/comments`);
}

export function createComment(paperId, content) {
  return apiFetch(`/api/papers/${paperId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function updateComment(paperId, commentId, content) {
  return apiFetch(`/api/papers/${paperId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(paperId, commentId) {
  return apiFetch(`/api/papers/${paperId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}
