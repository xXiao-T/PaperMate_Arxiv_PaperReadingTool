import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const paperAPI = {
  getAll: () => api.get('/papers'),
  getRecent: () => api.get('/papers/recent'),
  getById: (id) => api.get(`/papers/${id}`),
  getByArxivId: (arxivId) => api.get(`/papers/arxiv/${arxivId}`),
  getByCategory: (category) => api.get(`/papers/category/${category}`),
  getAllCategories: () => api.get('/papers/categories'),
  fetch: (arxivId) => api.post('/papers/fetch', { arxivId }),
  batchFetch: (arxivIds) => api.post('/papers/batch-fetch', { arxivIds }),
  update: (id, data) => api.put(`/papers/${id}`, data),
  delete: (id) => api.delete(`/papers/${id}`),
}

export const analysisAPI = {
  analyze: (paperId) => api.post(`/analysis/${paperId}`),
  getConcepts: (paperId) => api.get(`/analysis/concepts/${paperId}`),
  searchConcepts: (keyword) => api.get(`/analysis/concepts/search?keyword=${keyword}`),
}

export const searchAPI = {
  search: (params) => api.post('/search', params),
  byKeyword: (keyword) => api.get(`/search/keyword?keyword=${keyword}`),
  byAuthor: (author) => api.get(`/search/author?author=${author}`),
  byCategory: (category) => api.get(`/search/category?category=${category}`),
  suggestions: (keyword) => api.get(`/search/suggestions?keyword=${keyword}`),
}

export const qaAPI = {
  ask: (paperId, question) => api.post('/qa', { paperId, question }),
  getByPaper: (paperId) => api.get(`/qa/paper/${paperId}`),
}

export const noteAPI = {
  create: (paperId, content, noteType = 'note', userId = 1) => 
    api.post('/notes', { paperId, userId, content, noteType }),
  getByPaper: (paperId) => api.get(`/notes/paper/${paperId}`),
  getByUser: (userId) => api.get(`/notes/user/${userId}`),
  update: (noteId, content) => api.put(`/notes/${noteId}`, { content }),
  delete: (noteId) => api.delete(`/notes/${noteId}`),
}

export default api