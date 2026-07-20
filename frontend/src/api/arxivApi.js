import { apiFetch } from './request';

export function searchArxiv(keyword, searchType = 'all', maxResults = 30, sortBy = 'relevance', sortOrder = 'descending', category = '') {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  params.set('searchType', searchType);
  params.set('maxResults', String(maxResults));
  params.set('sortBy', sortBy);
  params.set('sortOrder', sortOrder);
  if (category) params.set('category', category);
  return apiFetch(`/api/arxiv/search?${params}`);
}