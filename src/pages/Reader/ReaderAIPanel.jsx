/**
 * ReaderAIPanel.jsx — AI 对话面板容器
 * ────────────────────────────────────────
 * 组合 ChatBubble + QuickActions + ChatInput，
 * 通过 useChat Hook 管理对话状态。
 *
 * 接收 Reader 传入的 paperContext 以自动注入论文信息。
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Bot, ChevronRight, Trash2, Square } from 'lucide-react';
import ChatBubble from '../../components/ChatBubble/ChatBubble';
import QuickActions from './QuickActions';
import './ReaderAIPanel.css';

export default function ReaderAIPanel({
  messages,
  isStreaming,
  error,
  hasError,
  onSend,
  onRetry,
  onStop,
  onClear,
  isDualMode,
  collapsed,
  onToggle,
}) {
  const chatListRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = React.useState('');

  // ---- 自动滚动到底部 ----
  const scrollToBottom = useCallback(() => {
    if (chatListRef.current) {
      const list = chatListRef.current;
      list.scrollTop = list.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ---- 输入处理 ----
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    onSend?.(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCommand = (command) => {
    if (isStreaming) return;
    onSend?.(command);
  };

  // ---- 折叠状态 ----
  if (collapsed) {
    return (
      <div
        className="rap-collapsed-strip"
        onClick={() => onToggle?.(false)}
        title="展开对话面板"
      >
        <Bot size={20} color="#9eb5db" />
        <ChevronRight size={20} color="#9eb5db" />
      </div>
    );
  }

  return (
    <div className="rap-panel">
      {/* 头部 */}
      <div className="rap-header">
        <span className="rap-header-title">
          <Bot size={18} color="#9eb5db" />
          <span>AI 论文助手</span>
          {isStreaming && <span className="rap-streaming-badge">生成中</span>}
        </span>
        <div className="rap-header-actions">
          {isStreaming && (
            <button
              type="button"
              className="rap-icon-btn rap-stop-btn"
              onClick={onStop}
              title="停止生成"
            >
              <Square size={14} />
            </button>
          )}
          {messages.length > 0 && !isStreaming && (
            <button
              type="button"
              className="rap-icon-btn"
              onClick={onClear}
              title="清空对话"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            className="rap-icon-btn"
            onClick={() => onToggle?.(true)}
            title="收起面板"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="rap-message-list" ref={chatListRef}>
        {messages.length === 0 ? (
          <div className="rap-empty">
            <Bot size={36} color="#cbd5e1" strokeWidth={1.5} />
            <p className="rap-empty-text">向 AI 论文助手提问</p>
            <p className="rap-empty-hint">可以输入 / 查看快捷指令</p>
            <QuickActions
              isDualMode={isDualMode}
              isStreaming={isStreaming}
              onCommand={handleCommand}
            />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isLast={idx === messages.length - 1}
                onRetry={idx === messages.length - 1 && msg.status === 'error' ? onRetry : undefined}
              />
            ))}
          </>
        )}
      </div>

      {/* 快捷指令（有消息时仍显示，但折叠为横向滚动条） */}
      {messages.length > 0 && (
        <div className="rap-quick-actions-inline">
          <QuickActions
            isDualMode={isDualMode}
            isStreaming={isStreaming}
            onCommand={handleCommand}
          />
        </div>
      )}

      {/* 输入区域 */}
      <div className="rap-input-area">
        <input
          ref={inputRef}
          type="text"
          className="rap-input"
          placeholder={isStreaming ? 'AI 正在生成回复...' : '输入消息，或使用快捷指令...'}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        <button
          type="button"
          className="rap-send-btn"
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isStreaming}
          title="发送"
        >
          发送
        </button>
      </div>
    </div>
  );
}