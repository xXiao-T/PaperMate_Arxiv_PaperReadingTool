import { apiFetch } from './request';

/** GET /api/library/favorites — 获取当前用户的收藏列表 */
export function getFavorites() {
  return apiFetch('/api/library/favorites');
}

/** POST /api/library/favorites — 收藏论文 (body: {paperId}) */
export function addFavorite(paperId) {
  return apiFetch('/api/library/favorites', {
    method: 'POST',
    body: JSON.stringify({ paperId }),
  });
}

/** DELETE /api/library/favorites/{paperId} — 取消收藏 */
export function removeFavorite(paperId) {
  return apiFetch(`/api/library/favorites/${paperId}`, { method: 'DELETE' });
}

/** POST /api/library/stars — 切换星标 (body: {paperId}) */
export function toggleStar(paperId) {
  return apiFetch('/api/library/stars', {
    method: 'POST',
    body: JSON.stringify({ paperId }),
  });
}
