import { apiFetch } from './request';

// ── 频率映射：前端中文 ↔ 后端英文 ──

const FREQ_TO_API = {
  '每天': 'daily',
  '每周一': 'weekly',
  '每月1日': 'monthly',
  '仅一次': 'once',
};

const FREQ_FROM_API = {
  'daily': '每天',
  'weekly': '每周一',
  'monthly': '每月1日',
  'once': '仅一次',
};

// ── 工具：DTO 转换 ──

/** 后端 DTO → 前端 task 对象 */
function fromApiDto(dto) {
  return {
    id: dto.id,
    name: dto.name,
    keywords: dto.keywords,
    category: dto.category || null,
    freqPeriod: FREQ_FROM_API[dto.freqPeriod] || dto.freqPeriod,
    freqHour: dto.freqHour ?? 9,
    tags: dto.autoTags || [],          // 后端 autoTags → 前端 tags
    status: dto.status,
    lastRunAt: dto.lastRunAt,
    nextRunAt: dto.nextRunAt,
  };
}

/** 前端表单 → 后端请求体 */
function toApiPayload(formData) {
  return {
    name: formData.name?.trim() || '',
    keywords: formData.keywords?.trim() || '',
    category: formData.category || null,
    freqPeriod: FREQ_TO_API[formData.freqPeriod] || formData.freqPeriod || 'daily',
    freqHour: formData.freqHour ?? 9,
    autoTags: Array.isArray(formData.tags)
      ? formData.tags.join(',')
      : (formData.autoTags || null),
  };
}

// ── API 方法 ──

/** GET /api/fetch/tasks — 获取所有抓取任务 */
export async function getFetchTasks() {
  const list = await apiFetch('/api/fetch/tasks');
  return (list || []).map(fromApiDto);
}

/** POST /api/fetch/tasks — 创建任务 */
export async function createFetchTask(formData) {
  const dto = await apiFetch('/api/fetch/tasks', {
    method: 'POST',
    body: JSON.stringify(toApiPayload(formData)),
  });
  return fromApiDto(dto);
}

/** PUT /api/fetch/tasks/{id} — 编辑任务 */
export async function updateFetchTask(id, formData) {
  const dto = await apiFetch(`/api/fetch/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toApiPayload(formData)),
  });
  return fromApiDto(dto);
}

/** DELETE /api/fetch/tasks/{id} — 删除任务 */
export function deleteFetchTask(id) {
  return apiFetch(`/api/fetch/tasks/${id}`, { method: 'DELETE' });
}

/** POST /api/fetch/tasks/{id}/run — 立即执行 */
export function runFetchTaskNow(id) {
  return apiFetch(`/api/fetch/tasks/${id}/run`, { method: 'POST' });
}

/** PUT /api/fetch/tasks/{id}/status — 切换状态 */
export async function toggleFetchTaskStatus(id) {
  const dto = await apiFetch(`/api/fetch/tasks/${id}/status`, { method: 'PUT' });
  return fromApiDto(dto);
}
