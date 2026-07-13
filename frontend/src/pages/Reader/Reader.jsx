/**
 * Reader.jsx — 论文阅读页面（重构版）
 * ────────────────────────────────────────
 * 职责分离：
 *   - PDF / 笔记 / 双列对比 → 内联 render
 *   - AI 对话 → 委托给 ReaderAIPanel + useChat Hook
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FileText, ChevronLeft, ChevronRight, Plus, Star, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Reader.css';
import '../Library/Library.css';
import useChat from '../../hooks/useChat';
import ReaderAIPanel from './ReaderAIPanel';
import { useReaderContext } from '../../contexts/ReaderContext';

// ============================================================
//  工具函数
// ============================================================

function hashTagColor(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  const hue = Math.abs(hash) % 360;
  return {
    backgroundColor: `hsl(${hue}, 60%, 90%)`,
    color: `hsl(${hue}, 60%, 25%)`,
    borderColor: `hsla(${hue}, 60%, 78%, 0.7)`,
  };
}

// ============================================================
//  固定数据（后续从后端加载）
// ============================================================

const LIBRARY_PAPERS = [
  {
    id: 1,
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    publishedAt: '2017-06-12',
    tags: ['自然语言处理', 'Transformer'],
    abstract: '提出了一种全新的基于自注意力机制的序列转换模型Transformer，摒弃了传统的循环和卷积结构，在机器翻译等任务上取得了突破性成果。',
  },
  {
    id: 2,
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Devlin et al.',
    publishedAt: '2018-10-11',
    tags: ['自然语言处理', '预训练模型'],
    abstract: '提出了BERT预训练语言模型，通过掩码语言模型和下一句预测任务，在11项自然语言处理任务上刷新了最佳成绩。',
  },
  {
    id: 3,
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: 'Krizhevsky, Sutskever & Hinton',
    publishedAt: '2012-12-03',
    tags: ['计算机视觉', '深度学习'],
    abstract: '提出了AlexNet深度卷积神经网络，在ImageNet大规模图像识别竞赛中以显著优势夺冠，开启了深度学习在计算机视觉领域的新纪元。',
  },
  {
    id: 4,
    title: 'Latent Dirichlet Allocation',
    authors: 'Blei, Ng & Jordan',
    publishedAt: '2003-01-01',
    tags: ['机器学习', '主题模型'],
    abstract: '提出了LDA主题模型，一种基于贝叶斯框架的生成式概率模型，广泛应用于文本挖掘、信息检索和推荐系统等领域。',
  },
];

// ============================================================
//  子组件：PDF 查看区
// ============================================================

function PDFViewer({ paper, isDualMode, onKick }) {
  return (
    <div className="reader-main reader-main-split">
      <div className="reader-pdf-toolbar">
        <span className="reader-page-label">Page 当前页 / 总页数</span>
        {isDualMode && (
          <button
            type="button"
            className="reader-kick-btn"
            onClick={() => onKick(paper)}
            title="移除此文献"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="pdf-placeholder">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#475569' }}>{paper.title}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>[ PDF 渲染引擎区域 ]</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  子组件：添加第二篇文献弹窗
// ============================================================

function AddPaperModal({ primaryPaper, libraryPapers, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="import-meta-card reader-add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-meta-header">
          <div className="import-meta-title">加入第二篇...</div>
          <button className="btn-action btn-secondary" onClick={onClose}>
            取消
          </button>
        </div>
        <div className="reader-add-grid">
          {libraryPapers.map((libPaper) => {
            const isCurrent = libPaper.id === primaryPaper.id;
            return (
              <div
                key={libPaper.id}
                className={`glass-panel library-card${isCurrent ? ' reader-current-paper' : ''}`}
                style={{ padding: '16px 20px', cursor: isCurrent ? 'default' : 'pointer' }}
                onClick={isCurrent ? undefined : () => onSelect(libPaper)}
              >
                <div className="card-header" style={{ marginBottom: '12px' }}>
                  <div>
                    <div className="card-title-group" style={{ marginBottom: '6px' }}>
                      <h2 className="card-title" style={{ fontSize: '16px' }}>{libPaper.title}</h2>
                      <Star size={18} color="#fbbf24" fill="#fbbf24" style={{ cursor: 'pointer', flexShrink: 0 }} />
                    </div>
                    <div className="card-meta">
                      <span>{libPaper.authors}</span>
                      <span className="meta-dot"></span>
                      <span>{libPaper.publishedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="tag-group" style={{ marginBottom: 8 }}>
                  {libPaper.tags.map((tag) => (
                    <span key={tag} className="tag" style={hashTagColor(tag)}>{tag}</span>
                  ))}
                </div>
                <div className="abstract-text" style={{ fontSize: '13px' }}>{libPaper.abstract}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  主组件：Reader
// ============================================================

export default function Reader() {
  const location = useLocation();
  const initialPaper = location.state?.paper || { id: 1, title: '文献标题' };
  const { setTitle, setSecondTitle } = useReaderContext();

  // ---- 论文状态 ----
  const [primaryPaper, setPrimaryPaper] = useState(initialPaper);
  const [secondPaper, setSecondPaper] = useState(null);
  const isDualMode = secondPaper !== null;

  // ---- 同步标题到 MainLayout header ----
  useEffect(() => {
    setTitle(primaryPaper.title || '');
    setSecondTitle(secondPaper ? secondPaper.title : '');
  }, [primaryPaper, secondPaper, setTitle, setSecondTitle]);

  // ---- 离开页面时清除标题 ----
  useEffect(() => {
    return () => {
      setTitle('');
      setSecondTitle('');
    };
  }, [setTitle, setSecondTitle]);

  // ---- UI 折叠状态 ----
  const [notesCollapsed, setNotesCollapsed] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ---- 论文上下文（传给 AI） ----
  const paperContext = useMemo(
    () => ({
      primary: primaryPaper,
      secondary: secondPaper || undefined,
    }),
    [primaryPaper, secondPaper],
  );

  // ---- AI 对话 Hook ----
  const {
    messages,
    isStreaming,
    error,
    hasError,
    send,
    retry,
    stop,
    clear,
  } = useChat({ paperContext });

  // ---- 文献操作 ----
  const handleSelectSecondPaper = useCallback((selectedPaper) => {
    setSecondPaper(selectedPaper);
    setShowAddModal(false);
    setNotesCollapsed(true);
    setAiCollapsed(true);
  }, []);

  const handleKickPaper = useCallback((paperToKick) => {
    if (paperToKick.id === primaryPaper.id) {
      setPrimaryPaper(secondPaper);
    }
    setSecondPaper(null);
  }, [primaryPaper.id, secondPaper]);

  // ---- 面板折叠 ----
  const handleNotesToggle = useCallback((collapsed) => {
    setNotesCollapsed(collapsed);
    if (isDualMode && !collapsed) setAiCollapsed(true);
  }, [isDualMode]);

  const handleAiToggle = useCallback((collapsed) => {
    setAiCollapsed(collapsed);
    if (isDualMode && !collapsed) setNotesCollapsed(true);
  }, [isDualMode]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* 三栏布局 */}
      <div className="reader-layout">
        <div className="reader-notes">
          {/* ---- 左侧：笔记面板 ---- */}
          {!isDualMode && (
            <div className={`reader-notes-panel${notesCollapsed ? ' reader-notes-panel-collapsed' : ''}`}>
              {notesCollapsed ? (
                <div className="collapsed-strip" onClick={() => handleNotesToggle(false)} title="展开笔记面板">
                  <ChevronRight size={20} color="#8b5cf6" />
                  <FileText size={20} color="#8b5cf6" />
                </div>
              ) : (
                <div className="glass-panel reader-notes-panel-inner">
                  <h3 className="reader-notes-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#8b5cf6" /> 我的笔记
                    </span>
                    <button
                      type="button"
                      className="collapse-toggle-btn"
                      onClick={() => handleNotesToggle(true)}
                      title="收起笔记面板"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </h3>
                  <div className="reader-notes-body">
                    还没有笔记哟
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- 中间：PDF 区域 ---- */}
          <div className="reader-main-area">
            <PDFViewer paper={primaryPaper} isDualMode={isDualMode} onKick={handleKickPaper} />
            {isDualMode && (
              <PDFViewer paper={secondPaper} isDualMode={isDualMode} onKick={handleKickPaper} />
            )}
          </div>

          {/* 右侧 + 按钮（单列模式） */}
          {!isDualMode && (
            <div className="reader-add-btn-area">
              <button
                type="button"
                className="reader-add-btn reader-add-btn-side"
                onClick={() => setShowAddModal(true)}
                title="加入第二篇..."
              >
                <Plus size={18} />
              </button>
            </div>
          )}

          {/* ---- 右侧：AI 对话面板 ---- */}
          <div className={`reader-sidebar${aiCollapsed ? ' reader-sidebar-collapsed' : ''}`}>
            <ReaderAIPanel
              messages={messages}
              isStreaming={isStreaming}
              error={error}
              hasError={hasError}
              onSend={send}
              onRetry={retry}
              onStop={stop}
              onClear={clear}
              isDualMode={isDualMode}
              collapsed={aiCollapsed}
              onToggle={handleAiToggle}
            />
          </div>
        </div>
      </div>

      {/* 添加第二篇文献弹窗 */}
      {showAddModal && (
        <AddPaperModal
          primaryPaper={primaryPaper}
          libraryPapers={LIBRARY_PAPERS}
          onSelect={handleSelectSecondPaper}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}