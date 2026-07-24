import { apiFetch } from './request';

export function searchPapers(keyword, tag, page = 0, pageSize = 20) {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (tag) params.set('tag', tag);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiFetch(`/api/papers?${params}`);
}

export function getPaperDetail(id) {
  return apiFetch(`/api/papers/${id}`);
}

export function importPaper(paperData) {
  return apiFetch('/api/papers', {
    method: 'POST',
    body: JSON.stringify(paperData),
  });
}

export function uploadPaperPdf(paperId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch(`/api/papers/${paperId}/upload-pdf`, {
    method: 'POST',
    body: formData,
  });
}
