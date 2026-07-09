import React, { useState, useRef, useEffect } from 'react';
import { Bot, FileText, Highlighter } from 'lucide-react';
import './Reader.css';

export default function Reader() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const chatListRef = useRef(null);
  const pendingScrollRef = useRef(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px' }}>文献标题</h1>
        </div>
      </header>

      <div className="reader-layout">
        <div className="reader-notes">
          <div className="glass-panel reader-notes-panel">
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <FileText size={18} color="#8b5cf6" /> 我的笔记
            </h3>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: '20px', padding: '18px', color: '#747b86', fontSize: '14px', overflowY: 'auto' }}>
              还没有笔记哟
            </div>
          </div>

          {/* 中间 PDF 区域 */}
          <div className="reader-main">
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Page 当前页 / 总页数</span>
            </div>
            <div className="pdf-placeholder">
              [ PDF 渲染引擎区域 (如 react-pdf) ]
            </div>
          </div>

          {/* 右侧 AI 侧边栏 */}
          <div className="reader-sidebar">
            <div className="glass-panel reader-ai-panel">
              <div className="chat-panel-top">
                <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Bot size={18} color="#9eb5db" /> 聊点什么？
                </h3>
                <div className="chat-list" ref={chatListRef}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}
                    >
                      <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chat-input-wrapper">
                <div className="chat-input-actions">
                  <button type="button" className="chat-action-button">分析总结</button>
                  <button type="button" className="chat-action-button">横向对比</button>
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
          </div>
        </div>
      </div>
    </div>
  );
}