import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink, MessageSquare, Tag, Trash2 } from 'lucide-react';
import './PaperDetail.css';
import '../Library/Library.css';

export default function PaperDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const paper = location.state?.paper || {
    title: '文献名',
    authors: '作者名',
    publishedAt: '发布时间',
    tags: ['标签名'],
    abstract: '摘要内容摘要内容摘要内容摘要内容摘要内容摘要内容摘要内容摘要内容摘要内容摘要内容',
  };
  const [paperTags, setPaperTags] = useState(paper.tags || []);
  const [comments, setComments] = useState([]);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [modalSelectedTags, setModalSelectedTags] = useState([]);

  const ALL_TAGS = ['自然语言处理', 'Transformer', '预训练模型', '计算机视觉', '深度学习', '机器学习', '主题模型', '导入文献'];

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
  const [activeCommentId, setActiveCommentId] = useState(null);
  const nextCommentId = useRef(1);
  const commentInputRefs = useRef({});
  const commentSectionRef = useRef(null);

  useEffect(() => {
    if (activeCommentId && commentInputRefs.current[activeCommentId]) {
      commentInputRefs.current[activeCommentId].focus();
    }
  }, [activeCommentId]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (commentSectionRef.current && !commentSectionRef.current.contains(event.target)) {
        setActiveCommentId(null);
        setComments((prev) => prev.filter((comment) => comment.text.trim() !== ''));
        if (document.activeElement instanceof HTMLElement && commentSectionRef.current.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);


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

  const addComment = () => {
    const newComment = {
      id: nextCommentId.current,
      text: '',
      timestamp: '刚刚',
    };
    nextCommentId.current += 1;
    setComments((prev) => [newComment, ...prev.filter((comment) => comment.text.trim() !== '')]);
    setActiveCommentId(newComment.id);
  };

  const deleteComment = (id) => {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
    if (activeCommentId === id) {
      setActiveCommentId(null);
    }
  };

  const updateCommentText = (id, value) => {
    setComments((prev) => prev.map((comment) => (
      comment.id === id ? { ...comment, text: value } : comment
    )));
  };

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
              <button className="btn-action btn-primary-blue" onClick={() => navigate('/reader', { state: { paper } })} style={{ padding: '12px 28px', fontSize: '16px' }}>
                <Play size={18} fill="currentColor" /> 开始阅读
              </button>
            </div>
          </div>

          {/* 摘要卡片 */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 className="detail-section-title"><Tag size={20} color="#3b82f6" /> Abstract (摘要)</h3>
            <div className="abstract-box">
              {paper.abstract}
            </div>
          </div>
        </div>

        {/* 右侧评论 */}
        <div className="detail-right-column">
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }} ref={commentSectionRef}>
            <h3 className="detail-section-title"><MessageSquare size={20} color="#8b5cf6" /> 我的评论</h3>
            {comments.length === 0 ? (
              <div className="comment-card">
                <p style={{ fontSize: '14px', color: '#334155', marginBottom: '8px' }}>暂无评论，点击下方新建评论开始。</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`comment-card ${activeCommentId === comment.id ? 'comment-card-focused' : ''}`}
                  onClick={() => setActiveCommentId(comment.id)}
                >
                  <textarea
                    id={`comment-input-${comment.id}`}
                    ref={(el) => { commentInputRefs.current[comment.id] = el; }}
                    className="comment-input"
                    value={comment.text}
                    onChange={(e) => updateCommentText(comment.id, e.target.value)}
                    onFocus={() => setActiveCommentId(comment.id)}
                    placeholder="输入评论内容..."
                    rows={3}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{comment.timestamp}</span>
                  <button className="comment-delete-btn" onClick={() => deleteComment(comment.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            <button
              className="btn-action"
              style={{ width: '100%', justifyContent: 'center', background: 'white', color: '#3b82f6', border: '1px dashed #3b82f6' }}
              onClick={addComment}
            >
              + 新建评论
            </button>
          </div>
        </div>
      </div>

      {/* 添加标签弹窗（页面级） */}
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