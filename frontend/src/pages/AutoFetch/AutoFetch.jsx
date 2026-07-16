import React, { useState, useEffect, useRef } from 'react';
import { Plus, Rss, PauseCircle, PlayCircle, CheckSquare, Layers, Trash2, Search, Loader2 } from 'lucide-react';
import './AutoFetch.css';
import '../Library/Library.css';
import '../PaperDetail/PaperDetail.css';
import { getFetchTasks, createFetchTask, updateFetchTask, deleteFetchTask, runFetchTaskNow, toggleFetchTaskStatus } from '../../api/fetchApi';

const ALL_TAGS = ['星标', '自然语言处理', 'Transformer', '预训练模型', '计算机视觉', '深度学习', '机器学习', '主题模型', '导入文献'];
const freqMatchMap = {
  '每天': /每天/,
  '每周一': /每周/,
  '每月1日': /每月/,
  '仅一次': /仅一次/,
};

export default function AutoFetch() {
  const [searchText, setSearchText] = useState('');
  const [searchFrequency, setSearchFrequency] = useState('全部');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [deleteConfirmPending, setDeleteConfirmPending] = useState(false);
  const deleteTimerRef = useRef(null);
  const panelRef = useRef(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [autoTags, setAutoTags] = useState([]);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [tagModalContext, setTagModalContext] = useState('create');
  const [modalSelectedTags, setModalSelectedTags] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editName, setEditName] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editFreqPeriod, setEditFreqPeriod] = useState('每天');
  const [editFreqHour, setEditFreqHour] = useState(8);
  const [editTags, setEditTags] = useState([]);

  // 创建任务表单状态
  const [createName, setCreateName] = useState('');
  const [createKeywords, setCreateKeywords] = useState('');
  const [createFreqPeriod, setCreateFreqPeriod] = useState('每天');
  const [createFreqHour, setCreateFreqHour] = useState(8);
  const [createErrors, setCreateErrors] = useState({});

  const handleCreateTask = async () => {
    const errors = {};
    if (!createName.trim()) errors.name = '请输入任务名';
    const trimmedKeywords = createKeywords.trim();
    if (!trimmedKeywords) {
      errors.keywords = '请输入追踪关键词';
    } else if (!/^[a-zA-Z][a-zA-Z0-9\s\-]*(,\s[a-zA-Z][a-zA-Z0-9\s\-]*)*$/.test(trimmedKeywords)) {
      errors.keywords = '关键词间请用（英文逗号和）空格分隔，如 a, b 或 a b';
    }
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});
    try {
      const newTask = await createFetchTask({
        name: createName.trim(),
        keywords: createKeywords.trim(),
        freqPeriod: createFreqPeriod,
        freqHour: createFreqHour,
        tags: [...autoTags],
      });
      setTasks((prev) => [newTask, ...prev]);
      setCreateName('');
      setCreateKeywords('');
      setCreateFreqPeriod('每天');
      setCreateFreqHour(8);
      setAutoTags([]);
    } catch (err) {
      alert('创建任务失败: ' + err.message);
    }
  };

  const hashStringToColor = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
      hash &= hash;
    }
    const hue = Math.abs(hash) % 360;
    const saturation = 60;
    const lightness = 90;
    const textLightness = 25;
    return {
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      color: `hsl(${hue}, ${saturation}%, ${textLightness}%)`,
      borderColor: `hsla(${hue}, ${saturation}%, ${lightness - 12}%, 0.7)`,
    };
  };

  const modalAvailableTags = (() => {
    const existing = tagModalContext === 'create' ? autoTags : editTags;
    return ALL_TAGS.filter((t) => !existing.includes(t));
  })();

  const toggleModalTag = (tag) => {
    setModalSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const confirmAddTags = () => {
    if (modalSelectedTags.length > 0) {
      if (tagModalContext === 'create') {
        setAutoTags((prev) => [...prev, ...modalSelectedTags]);
      } else {
        setEditTags((prev) => [...prev, ...modalSelectedTags]);
      }
      setModalSelectedTags([]);
    }
    setAddTagModalOpen(false);
  };

  const openCreateTagModal = () => {
    setTagModalContext('create');
    setModalSelectedTags([]);
    setAddTagModalOpen(true);
  };

  const openEditTagModal = () => {
    setTagModalContext('edit');
    setModalSelectedTags([]);
    setAddTagModalOpen(true);
  };

  const removeAutoTag = (tagToRemove, e) => {
    e.stopPropagation();
    e.preventDefault();
    setAutoTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditName(task.name);
    setEditKeywords(task.keywords);
    setEditFreqPeriod(task.freqPeriod);
    setEditFreqHour(task.freqHour);
    setEditTags([...task.tags]);
    setModalSelectedTags([]);
    setEditModalOpen(true);
  };

  const removeEditTag = (tagToRemove) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── 初始加载任务列表 ──
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getFetchTasks();
      setTasks(data);
    } catch (err) {
      console.error('加载抓取任务失败:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadTasks(); }, []);

  const toggleTaskStatus = async (taskId, e) => {
    e.stopPropagation();
    try {
      const updated = await toggleFetchTaskStatus(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      alert('切换状态失败: ' + err.message);
    }
  };

  const toggleSelectAll = () => {
    const allIds = tasks.map((t) => t.id);
    if (selectedTaskIds.length === allIds.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(allIds);
    }
  };

  const exitMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedTaskIds([]);
  };

  const runSelected = () => {
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.includes(t.id) ? { ...t, status: 'active' } : t
      )
    );
    exitMultiSelect();
  };

  const pauseSelected = () => {
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.includes(t.id) ? { ...t, status: 'paused' } : t
      )
    );
    exitMultiSelect();
  };

  const handleDeleteClick = async () => {
    if (deleteConfirmPending) {
      clearTimeout(deleteTimerRef.current);
      setDeleteConfirmPending(false);
      try {
        await Promise.all(selectedTaskIds.map((id) => deleteFetchTask(id)));
      } catch (err) {
        alert('部分删除失败: ' + err.message);
      }
      setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id)));
      exitMultiSelect();
    } else {
      setDeleteConfirmPending(true);
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirmPending(false);
      }, 3000);
    }
  };

  const deleteTask = async () => {
    if (!editingTask) return;
    try {
      await deleteFetchTask(editingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== editingTask.id));
    } catch (err) {
      alert('删除失败: ' + err.message);
    }
    setEditModalOpen(false);
    setEditingTask(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (multiSelectMode && panelRef.current && !panelRef.current.contains(e.target)) {
        exitMultiSelect();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [multiSelectMode]);

  const saveEdit = async () => {
    try {
      const updated = await updateFetchTask(editingTask.id, {
        name: editName,
        keywords: editKeywords,
        freqPeriod: editFreqPeriod,
        freqHour: editFreqHour,
        tags: [...editTags],
      });
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
    } catch (err) {
      alert('保存失败: ' + err.message);
    }
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    // Frequency filter
    if (searchFrequency !== '全部' && !freqMatchMap[searchFrequency].test(task.freqPeriod)) {
      return false;
    }
    // Text search filter
    if (!searchText.trim()) return true;
    const searchLower = searchText.trim().toLowerCase();
    // Split into tokens (keywords/tags matched individually, name matched as substring)
    const tokens = searchLower.split(/[,，\s]+/).filter(Boolean);
    const nameLower = task.name.toLowerCase();
    const keywordsLower = task.keywords.toLowerCase();
    const tagsLower = task.tags.map((t) => t.toLowerCase());

    return tokens.every((token) => {
      if (nameLower.includes(token)) return true;
      if (keywordsLower.includes(token)) return true;
      if (tagsLower.some((tag) => tag.includes(token))) return true;
      return false;
    });
  });

  return (
    <div style={{ height: '100%' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">让文献来找我</h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '32px' }}>
        <div className="form-card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="#3b82f6" /> 新建抓取规则
          </h3>
          <div className="form-group">
            <label className="form-label">任务名</label>
            <input
              type="text"
              className={`form-input${createErrors.name ? ' form-input-error' : ''}`}
              placeholder="让文献来找我..."
              value={createName}
              onChange={(e) => { setCreateName(e.target.value); setCreateErrors((prev) => ({ ...prev, name: undefined })); }}
            />
            {createErrors.name && <span className="form-error-hint">{createErrors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">追踪关键词 (Keywords)</label>
            <input
              type="text"
              className={`form-input${createErrors.keywords ? ' form-input-error' : ''}`}
              placeholder="e.g. machine learning, reinforcement learning, deep learning"
              value={createKeywords}
              onChange={(e) => { setCreateKeywords(e.target.value); setCreateErrors((prev) => ({ ...prev, keywords: undefined })); }}
            />
            {createErrors.keywords && <span className="form-error-hint">{createErrors.keywords}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">抓取频率</label>
            <div className="fetch-frequency-row">
              <select
                className="form-input fetch-freq-select"
                value={createFreqPeriod}
                onChange={(e) => setCreateFreqPeriod(e.target.value)}
              >
                <option>每天</option>
                <option>每周一</option>
                <option>每月1日</option>
                <option>仅一次</option>
              </select>
              <select
                className="form-input fetch-freq-select"
                value={createFreqHour}
                onChange={(e) => setCreateFreqHour(Number(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">自动标签</label>
            <div className="library-tag-bar" style={{ gap: '8px' }}>
              {autoTags.map((tag) => (
                <div key={tag} className="tag tag-chip tag-chip-tag" style={hashStringToColor(tag)}>
                  <span>{tag}</span>
                  <button type="button" className="tag-remove-button" onClick={(e) => removeAutoTag(tag, e)} aria-label={`删除标签 ${tag}`}>×</button>
                </div>
              ))}
              <button type="button" className="tag tag-chip tag-chip-add" onClick={openCreateTagModal}>+</button>
            </div>
          </div>
          <div className="form-group form-group-auto">
            <button className="btn-action btn-primary-blue" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreateTask}>
              创建定时任务
            </button>
          </div>
        </div>

        <div ref={panelRef} className="glass-panel" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>任务列表</h3>
          <div className="task-search-bar">
            <div className="task-search-input-wrapper">
              <Search size={14} className="task-search-icon" />
              <input
                type="text"
                className="task-search-input"
                placeholder="搜索任务名、关键词、标签..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button className="task-search-clear" onClick={() => setSearchText('')}>×</button>
              )}
            </div>
            <select
              className="task-frequency-filter"
              value={searchFrequency}
              onChange={(e) => setSearchFrequency(e.target.value)}
            >
              <option>全部</option>
              <option>每天</option>
              <option>每周一</option>
              <option>每月1日</option>
              <option>仅一次</option>
            </select>
          </div>
          <div className="reading-records-scroll">
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '8px' }}>加载中...</p>
              </div>
            )}
            {!loading && filteredTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Rss size={32} style={{ opacity: 0.4 }} />
                <p style={{ marginTop: '12px' }}>暂无抓取任务，去左侧新建一个吧</p>
              </div>
            )}
            {!loading && filteredTasks.map((task) => {
              const isSelected = multiSelectMode && selectedTaskIds.includes(task.id);
              const isDimmed = multiSelectMode && !selectedTaskIds.includes(task.id);
              return (
              <div
                key={task.id}
                className={`task-item task-item-expanded${isDimmed ? ' task-item-dimmed' : ''}${isSelected ? ' task-item-selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (multiSelectMode) {
                    setSelectedTaskIds((prev) =>
                      prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]
                    );
                  } else {
                    openEditModal(task);
                  }
                }}
              >
                <div className="task-item-body">
                  <div className="task-item-name">{task.name}</div>
                  <div className="task-item-info-row"><span className="task-item-value">{task.keywords}</span></div>
                  <div className="task-item-info-row"><span className="task-item-value">{task.freqPeriod} {String(task.freqHour).padStart(2, '0')}:00</span></div>
                  <div className="task-item-tags">
                    {task.tags.map((tag) => (<span key={tag} className="task-mini-tag" style={hashStringToColor(tag)}>{tag}</span>))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="status-badge status-toggle-btn"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await runFetchTaskNow(task.id);
                        await loadTasks(); // 刷新列表
                      } catch (err) { alert('执行失败: ' + err.message); }
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: 'none', background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}
                    title="立即执行一次"
                  >
                    <Rss size={12} /> 立即
                  </button>
                  <button
                    className={`status-badge status-toggle-btn ${task.status === 'active' ? 'status-active' : 'status-paused'}`}
                    onClick={(e) => toggleTaskStatus(task.id, e)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                  >
                    {task.status === 'active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                    {task.status === 'active' ? '运行中' : '已暂停'}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
          <div className="task-list-bottom-actions">
            <button
              className={`btn-action btn-multi-select${multiSelectMode ? ' btn-multi-select-active' : ''}`}
              onClick={() => {
                setMultiSelectMode((prev) => {
                  if (prev) setSelectedTaskIds([]);
                  return !prev;
                });
              }}
            >
              <CheckSquare size={14} /> {multiSelectMode ? '取消多选' : '多选'}
            </button>
            {multiSelectMode && (
              <span
                className={`select-all-icon${selectedTaskIds.length === tasks.length ? ' select-all-icon-active' : ''}`}
                onClick={toggleSelectAll}
                title={selectedTaskIds.length === tasks.length ? '全不选' : '全选'}
              >
                <Layers size={14} />
              </span>
            )}
            {multiSelectMode && selectedTaskIds.length > 0 && (
              <>
                <button className="btn-action btn-run-selected" onClick={runSelected}>
                  <PauseCircle size={14} /> 运行
                </button>
                <button className="btn-action btn-pause-selected" onClick={pauseSelected}>
                  <PlayCircle size={14} /> 暂停
                </button>
                <button
                  className={`btn-action btn-delete-selected${deleteConfirmPending ? ' btn-delete-confirm' : ''}`}
                  onClick={handleDeleteClick}
                >
                  <Trash2 size={14} /> 删除
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {addTagModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setAddTagModalOpen(false)}>
          <div className="import-meta-card" style={{ width: 'min(480px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div className="import-meta-title">添加标签</div>
              <button className="btn-action btn-secondary" onClick={() => setAddTagModalOpen(false)}>取消</button>
            </div>
            <div className="import-meta-form">
              <div className="form-group">
                <label className="form-label">选择标签（可多选）</label>
                <div className="tag-select-grid">
                  {modalAvailableTags.map((tag) => {
                    const isSelected = modalSelectedTags.includes(tag);
                    return (
                      <div key={tag} className={`tag tag-chip tag-chip-tag tag-chip-action ${isSelected ? 'tag-chip-active' : ''}`} style={isSelected ? hashStringToColor(tag) : { opacity: 0.6 }} onClick={() => toggleModalTag(tag)}>
                        <span>{tag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="import-meta-actions">
                <button className="btn-action btn-primary-blue" disabled={modalSelectedTags.length === 0} onClick={confirmAddTags}>
                  确认添加 ({modalSelectedTags.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="import-meta-card" style={{ width: 'min(540px, 100%)', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div className="import-meta-title">编辑任务</div>
              <button className="btn-action btn-secondary" onClick={() => setEditModalOpen(false)}>取消</button>
            </div>
            <div className="import-meta-form">
              <div className="form-group">
                <label className="form-label">任务名</label>
                <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">追踪关键词 (Keywords)</label>
                <input type="text" className="form-input" value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">抓取频率</label>
                <div className="fetch-frequency-row">
                  <select className="form-input fetch-freq-select" value={editFreqPeriod} onChange={(e) => setEditFreqPeriod(e.target.value)}>
                    <option>每天</option>
                    <option>每周一</option>
                    <option>每月1日</option>
                    <option>仅一次</option>
                  </select>
                  <select className="form-input fetch-freq-select" value={editFreqHour} onChange={(e) => setEditFreqHour(Number(e.target.value))}>
                    {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">自动标签</label>
                <div className="library-tag-bar" style={{ gap: '8px' }}>
                  {editTags.map((tag) => (
                    <div key={tag} className="tag tag-chip tag-chip-tag" style={hashStringToColor(tag)}>
                      <span>{tag}</span>
                      <button type="button" className="tag-remove-button" onClick={() => removeEditTag(tag)} aria-label={`删除标签 ${tag}`}>×</button>
                    </div>
                  ))}
                  <button type="button" className="tag tag-chip tag-chip-add" onClick={openEditTagModal}>+</button>
                </div>
              </div>
              <div className="import-meta-actions">
                <button className="btn-action btn-primary-blue" onClick={saveEdit}>保存修改</button>
                <button className="btn-action btn-delete-red" onClick={deleteTask}>删除任务</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}