import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink, MessageSquare, Tag, Trash2, Edit2, Plus } from 'lucide-react';
import { getComments, createComment, updateComment, deleteComment } from '../../api/commentApi';
import './PaperDetail.css';
import '../Library/Library.css';

export default function PaperDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const routedPaper = location.state?.paper || location.state;
  const paper = routedPaper?.id ? routedPaper : {
    id: null,
    title: '文献名',
    authors: '作者名',
    publishedAt: '发布时间',
    tags: ['标签名'],
    abstract: '摘要内容...',
  };

  const [paperTags, setPaperTags] = useState(paper.tags || []);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [modalSelectedTags, setModalSelectedTags] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const commentSectionRef = useRef(null);

  const ALL_TAGS = ['自然语言处理', 'Transformer', '预训练模型', '计算机视觉', '深度学习', '机器学习', '主题模型', '导入文献'];

  // ─── 加载评论 ──────────────────────────────────────────────────────

  useEffect(() => {
    if (paper?.id) {
      setLoading(true);
      getComments(paper.id)
        .then(data => {
          setComments(data || []);
        })
        .catch(err => {
          console.error('加载评论失败:', err);
          alert('加载评论失败: ' + err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [paper?.id]);

  // ─── 标签功能 ──────────────────────────────────────────────────────

  const availableTags = ALL_TAGS.filter((t) => !paperTags.includes(t));

  const removePaperTag = (tagToRemove, e) => {
    e.stopPropagation();
    e.preventDefault();
    setPaperTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleModalTag = (tag) => {
    setModalSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const confirmAddTags = () => {
    if (modalSelectedTags.length > 0) {
      setPaperTags((prev) => [...prev, ...modalSelectedTags]);
      setModalSelectedTags([]);
    }
    setAddTagModalOpen(false);
  };

  const openAddTagModal = () => {
    setModalSelectedTags([]);
    setAddTagModalOpen(true);
  };

  // ─── 评论 CRUD ─────────────────────────────────────────────────────

  const hashStringToColor = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
      hash &= hash;
    }
    const hue = Math.abs(hash) % 360;
    return {
      backgroundColor: `hsl(${hue}, 60%, 90%)`,
      color: `hsl(${hue}, 60%, 25%)`,
      borderColor: `hsla(${hue}, 60%, 55%, 0.5)`,
    };
  };

  // ─── 创建评论 ──────────────────────────────────────────────────────

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const created = await createComment(paper.id, newComment.trim());
      setComments(prev => [created, ...prev]);

      setShowAddModal(false);
      setNewComment('');
    } catch (err) {
      alert('添加评论失败: ' + err.message);
    }
  };

  // ─── 编辑评论 ──────────────────────────────────────────────────────

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) {
      alert('评论内容不能为空');
      return;
    }

    try {
      const updated = await updateComment(paper.id, id, editText.trim());

      setComments(prev =>
        prev.map(comment =>
          comment.id === id ? updated : comment
        )
      );
      setEditingId(null);
      setEditText('');
    } catch (err) {
      alert('更新评论失败: ' + err.message);
    }
  };

  // ─── 删除评论 ──────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!confirm('确定删除此评论吗？')) return;

    try {
      await deleteComment(paper.id, id);
      setComments(prev => prev.filter(comment => comment.id !== id));
    } catch (err) {
      alert('删除评论失败: ' + err.message);
    }
  };

  // ─── 渲染 ──────────────────────────────────────────────────────────

  return (
    <div className="detail-container">
      {/* 返回按钮 */}
      <div className="back-link" onClick={() => navigate('/library')}>
        <ArrowLeft size={16} /> 返回我的文库
      </div>

      <div className="detail-main-grid">
        <div className="detail-left-column">
          {/* 头部信息卡片 */}
          <div className="glass-panel detail-header-card">
            <h1 className="detail-title">{paper.title}</h1>
            <div className="detail-meta-row">
              <span className="detail-authors" style={{ marginBottom: 0 }}>{paper.authors}</span>
              <span className="detail-authors" style={{ marginBottom: 0 }}>{paper.publishedAt}</span>
              {paper.arxivUrl ? (
                <a
                  href={paper.arxivUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="arxiv-link"
                >
                  <ExternalLink size={14} /> arXiv原文
                </a>
              ) : (
                <span className="arxiv-link-disabled">
                  <ExternalLink size={14} /> 暂无arXiv原文链接
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
              <div className="library-tag-bar" style={{ gap: '8px' }}>
                {paperTags.map((tag) => (
                  <div key={tag} className="tag tag-chip tag-chip-tag" style={hashStringToColor(tag)}>
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="tag-remove-button"
                      onClick={(e) => removePaperTag(tag, e)}
                      aria-label={`删除标签 ${tag}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="tag tag-chip tag-chip-add" onClick={openAddTagModal}>
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                className="btn-action btn-primary-blue"
                onClick={() => navigate('/reader', { state: { paper } })}
                style={{ padding: '12px 28px', fontSize: '16px' }}
              >
                <Play size={18} fill="currentColor" /> 开始阅读
              </button>
            </div>
          </div>

          {/* 摘要卡片 */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 className="detail-section-title"><Tag size={20} color="#3b82f6" /> Abstract (摘要)</h3>
            <div className="abstract-box">{paper.abstract || paper.paperAbstract || ''}</div>
          </div>
        </div>

        {/* 右侧评论面板 */}
        <div className="detail-right-column">
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }} ref={commentSectionRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="detail-section-title" style={{ marginBottom: 0 }}>
                <MessageSquare size={20} color="#8b5cf6" /> 我的评论
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal', marginLeft: '8px' }}>
                  ({comments.length})
                </span>
              </h3>
              <button
                className="btn-action"
                style={{ padding: '6px 16px', background: '#8b5cf6', color: 'white', fontSize: '13px' }}
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} /> 新建评论
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                加载中...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p>暂无评论</p>
                <p style={{ fontSize: '13px' }}>写下你对这篇论文的看法</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {editingId === comment.id ? (
                      // ─── 编辑模式 ────────────────────────────────
                      <div>
                        <textarea
                          className="form-input"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            className="btn-action btn-primary-blue"
                            style={{ padding: '4px 16px', fontSize: '12px' }}
                            onClick={() => saveEdit(comment.id)}
                          >
                            保存
                          </button>
                          <button
                            className="btn-action btn-secondary"
                            style={{ padding: '4px 16px', fontSize: '12px', background: '#f1f5f9', color: '#475569' }}
                            onClick={cancelEdit}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ─── 显示模式 ────────────────────────────────
                      <>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {comment.content}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {comment.username ? `${comment.username} · ` : ''}
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString('zh-CN') : '刚刚'}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-action"
                              style={{ padding: '2px 10px', fontSize: '11px', background: '#eff6ff', color: '#2563eb' }}
                              onClick={() => startEdit(comment)}
                            >
                              <Edit2 size={12} /> 编辑
                            </button>
                            <button
                              className="btn-action"
                              style={{ padding: '2px 10px', fontSize: '11px', background: '#fef2f2', color: '#ef4444' }}
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 size={12} /> 删除
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 新建评论弹窗 ──────────────────────────────────────────── */}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="import-meta-card" style={{ width: 'min(480px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div className="import-meta-title">新建评论</div>
              <button className="btn-action btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
            </div>
            <div className="import-meta-form">
              <div className="form-group">
                <label className="form-label">评论内容 <span className="required-star">*</span></label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="输入评论内容..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <div className="import-meta-actions">
                <button className="btn-action btn-primary-blue" onClick={handleAddComment}>
                  保存评论
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 添加标签弹窗 ──────────────────────────────────────────── */}

      {addTagModalOpen && (
        <div className="modal-overlay" onClick={() => setAddTagModalOpen(false)}>
          <div className="import-meta-card" style={{ width: 'min(480px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div className="import-meta-title">添加标签</div>
              <button className="btn-action btn-secondary" onClick={() => setAddTagModalOpen(false)}>
                取消
              </button>
            </div>
            <div className="import-meta-form">
              <div className="form-group">
                <label className="form-label">选择标签（可多选）</label>
                <div className="tag-select-grid">
                  {availableTags.map((tag) => {
                    const isSelected = modalSelectedTags.includes(tag);
                    return (
                      <div
                        key={tag}
                        className={`tag tag-chip tag-chip-tag tag-chip-action ${isSelected ? 'tag-chip-active' : ''}`}
                        style={isSelected ? hashStringToColor(tag) : { opacity: 0.6 }}
                        onClick={() => toggleModalTag(tag)}
                      >
                        <span>{tag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="import-meta-actions">
                <button
                  className="btn-action btn-primary-blue"
                  disabled={modalSelectedTags.length === 0}
                  onClick={confirmAddTags}
                >
                  确认添加 ({modalSelectedTags.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
