import React, { useState, useRef, useEffect } from 'react';
import { Bot, FileText, Highlighter, Copy, Download, Check, ChevronLeft, ChevronRight, Plus, Star, X } from 'lucide-react';
import './Reader.css';
import { useLocation } from 'react-router-dom';
import './Library.css';

export default function Reader() {
  const location = useLocation();
  const initialPaper = location.state?.paper || {
    id: 1,
    title: '文献标题',
  };
  const [primaryPaper, setPrimaryPaper] = useState(initialPaper);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [actionStatus, setActionStatus] = useState({});
  const [notesCollapsed, setNotesCollapsed] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [secondPaper, setSecondPaper] = useState(null);
  const chatListRef = useRef(null);
  const pendingScrollRef = useRef(false);

  const libraryPapers = [
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

  const isDualMode = secondPaper !== null;

  const hashTagColor = (text) => {
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

  const handleSelectSecondPaper = (selectedPaper) => {
    setSecondPaper(selectedPaper);
    setShowAddModal(false);
    setNotesCollapsed(true);
    setAiCollapsed(true);
  };

  const handleKickPaper = (paperToKick) => {
    if (!isDualMode) return;
    if (paperToKick.id === primaryPaper.id) {
      // 踢走了主文献，第二篇升格为主文献
      setPrimaryPaper(secondPaper);
    }
    setSecondPaper(null);
  };

  const handleNotesToggle = (collapsed) => {
    setNotesCollapsed(collapsed);
    if (isDualMode && !collapsed) {
      setAiCollapsed(true);
    }
  };

  const handleAiToggle = (collapsed) => {
    setAiCollapsed(collapsed);
    if (isDualMode && !collapsed) {
      setNotesCollapsed(true);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const setActionSuccess = (key) => {
    setActionStatus((prev) => ({ ...prev, [key]: true }));
    window.setTimeout(() => {
      setActionStatus((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 3000);
  };

  const sendSystemQuery = (command, initialReply) => {
    pendingScrollRef.current = true;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: command },
      { role: 'ai', content: initialReply },
      { role: 'ai', content: '错误，请检查 API 设置' },
    ]);
  };

  const executeAnalyze = () => {
    sendSystemQuery('/analyze', '仔细分析文献...');
  };

  const executeCompare = () => {
    if (!isDualMode) {
      pendingScrollRef.current = true;
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: '/compare' },
        { role: 'ai', content: '点击“+”加入第二篇文献' },
      ]);
      return;
    }
    sendSystemQuery('/compare', '认真考察关联...');
  };

  const copyMessageText = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setActionSuccess(`${index}-copy`);
    } catch (error) {
      console.error('复制失败', error);
    }
  };

  const downloadMessageAsMd = (content, index) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-${index + 1}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionSuccess(`${index}-download`);
  };

  const handleInputSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // 检查系统指令
    if (trimmed === '/analyze') {
      setInputValue('');
      executeAnalyze();
      return;
    }
    if (trimmed === '/compare') {
      setInputValue('');
      executeCompare();
      return;
    }

    pendingScrollRef.current = true;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: trimmed },
      { role: 'ai', content: '错误，请检查 API 设置' },
    ]);
    setInputValue('');
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleInputSubmit();
    }
  };

  useEffect(() => {
    if (pendingScrollRef.current && chatListRef.current) {
      const list = chatListRef.current;
      list.scrollTop = list.scrollHeight;
      pendingScrollRef.current = false;
    }
  }, [messages]);

  const renderPDFViewer = (paperData, label) => (
    <div className="reader-main reader-main-split">
      <div className="reader-pdf-toolbar">
        <span className="reader-page-label">{label}</span>
        {isDualMode && (
          <button
            type="button"
            className="reader-kick-btn"
            onClick={() => handleKickPaper(paperData)}
            title="移除此文献"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="pdf-placeholder">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#475569' }}>{paperData.title}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>[ PDF 渲染引擎区域 ]</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px' }}>{primaryPaper.title}</h1>
          {isDualMode && (
            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '12px' }}>
              + {secondPaper.title}
            </span>
          )}
        </div>
      </header>

      <div className="reader-layout">
        <div className="reader-notes">
          {/* 左侧笔记面板（双列模式时完全隐藏） */}
          {!isDualMode && (
            <div className={`reader-notes-panel${notesCollapsed ? ' reader-notes-panel-collapsed' : ''}`}>
              {notesCollapsed ? (
                <div className="collapsed-strip" onClick={() => handleNotesToggle(false)} title="展开笔记面板">
                  <ChevronRight size={20} color="#8b5cf6" />
                  <FileText size={20} color="#8b5cf6" />
                </div>
              ) : (
                <div className="glass-panel reader-notes-panel-inner">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
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
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: '20px', padding: '18px', color: '#747b86', fontSize: '14px', overflowY: 'auto' }}>
                    还没有笔记哟
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 中间 PDF 区域 */}
          <div className="reader-main-area">
            {renderPDFViewer(primaryPaper, 'Page 当前页 / 总页数')}
            {isDualMode && renderPDFViewer(secondPaper, 'Page 当前页 / 总页数')}
          </div>

          {/* 右侧 + 按钮区域（仅单列模式时显示） */}
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

          {/* 右侧 AI 侧边栏 */}
          <div className={`reader-sidebar${aiCollapsed ? ' reader-sidebar-collapsed' : ''}`}>
            {aiCollapsed ? (
              <div className="collapsed-strip collapsed-strip-right" onClick={() => handleAiToggle(false)} title="展开对话面板">
                <Bot size={20} color="#9eb5db" />
                <ChevronLeft size={20} color="#9eb5db" />
              </div>
            ) : (
              <div className="glass-panel reader-ai-panel">
                <div className="chat-panel-top">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={18} color="#9eb5db" /> 聊点什么？
                    </span>
                    <button
                      type="button"
                      className="collapse-toggle-btn"
                      onClick={() => handleAiToggle(true)}
                      title="收起对话面板"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </h3>
                  <div className="chat-list" ref={chatListRef}>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}
                      >
                        <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                          <div>{message.content}</div>
                          <div className="bubble-actions">
                            <button
                              type="button"
                              className="bubble-icon-button"
                              onClick={() => copyMessageText(message.content, index)}
                              aria-label="复制回答"
                            >
                              {actionStatus[`${index}-copy`] ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            {message.role === 'ai' && (
                              <button
                                type="button"
                                className="bubble-icon-button"
                                onClick={() => downloadMessageAsMd(message.content, index)}
                                aria-label="下载回答"
                              >
                                {actionStatus[`${index}-download`] ? <Check size={16} /> : <Download size={16} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chat-input-wrapper">
                  <div className="chat-input-actions">
                    <button type="button" className="chat-action-button" onClick={executeAnalyze}>分析总结</button>
                    {isDualMode && (
                      <button type="button" className="chat-action-button" onClick={executeCompare}>横向对比</button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="随便问问什么 ..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="import-meta-card reader-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div className="import-meta-title">加入第二篇...</div>
              <button className="btn-action btn-secondary" onClick={() => setShowAddModal(false)}>
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
                    onClick={isCurrent ? undefined : () => handleSelectSecondPaper(libPaper)}
                  >
                    <div className="card-header" style={{ marginBottom: '12px' }}>
                      <div>
                        <div className="card-title-group" style={{ marginBottom: '6px' }}>
                          <h2 className="card-title" style={{ fontSize: '16px' }}>{libPaper.title}</h2>
                          <Star
                            size={18}
                            color="#fbbf24"
                            fill="#fbbf24"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0 }}
                          />
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
      )}
    </div>
  );
}