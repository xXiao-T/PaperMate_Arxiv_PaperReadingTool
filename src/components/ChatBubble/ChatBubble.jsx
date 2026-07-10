/**
 * ChatBubble.jsx — 消息气泡组件
 * ────────────────────────────────────────
 * 渲染单条对话消息，支持：
 *   - 用户消息 & AI 消息的不同样式
 *   - streaming / waiting / error / done 四种状态
 *   - 复制 & 下载（Markdown）
 *   - 重试按钮（仅 error 状态）
 *   - 对接后续 Markdown 渲染（预留 react-markdown 插槽）
 */

import React, { useCallback, useState } from 'react';
import { Copy, Download, Check, RefreshCw, Loader2 } from 'lucide-react';
import './ChatBubble.css';

/**
 * 操作按钮状态管理 Hook
 * 点击后显示 ✓ 图标，3 秒后恢复
 */
function useActionFeedback() {
  const [activeKey, setActiveKey] = useState(null);

  const trigger = useCallback((key) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 2500);
  }, []);

  return { activeKey, trigger };
}

/**
 * ChatBubble
 * @param {Object} props
 * @param {Object} props.message  - { id, role, content, timestamp, status, errorDetail }
 * @param {boolean} props.isLast  - 是否为最后一条消息（用于自动滚动锚点）
 * @param {Function} props.onRetry - 点击重试回调
 */
export default function ChatBubble({ message, isLast, onRetry }) {
  const { role, content, status } = message;
  const isUser = role === 'user';
  const isError = status === 'error';
  const isWaiting = status === 'waiting';
  const isStreaming = status === 'streaming';

  const { activeKey, trigger } = useActionFeedback();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      trigger(`${message.id}-copy`);
    } catch {
      // 忽略复制失败
    }
  }, [content, message.id, trigger]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paper-mate-response.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trigger(`${message.id}-download`);
  }, [content, message.id, trigger]);

  // 状态小图标
  const renderStatusIcon = () => {
    if (isWaiting) {
      return <Loader2 size={14} className="cb-spin" style={{ color: '#94a3b8' }} />;
    }
    if (isStreaming) {
      return (
        <span className="cb-streaming-dot" title="生成中...">
          <span className="cb-dot" />
        </span>
      );
    }
    return null;
  };

  // 气泡尾部操作栏
  const renderActions = () => {
    if (isWaiting) return null;

    return (
      <div className="cb-actions">
        {/* 错误时的重试按钮 */}
        {isError && onRetry && (
          <button
            type="button"
            className="cb-icon-btn cb-retry-btn"
            onClick={onRetry}
            title="重新生成"
          >
            <RefreshCw size={14} />
          </button>
        )}

        {/* 复制 */}
        {(content && !isWaiting) && (
          <button
            type="button"
            className="cb-icon-btn"
            onClick={handleCopy}
            title="复制"
          >
            {activeKey === `${message.id}-copy` ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}

        {/* AI 消息下载 */}
        {!isUser && content && !isWaiting && (
          <button
            type="button"
            className="cb-icon-btn"
            onClick={handleDownload}
            title="下载为 Markdown"
          >
            {activeKey === `${message.id}-download` ? <Check size={14} /> : <Download size={14} />}
          </button>
        )}
      </div>
    );
  };

  // 气泡内的错误信息
  const renderErrorDetail = () => {
    if (!isError || !message.errorDetail) return null;
    return (
      <div className="cb-error-detail">
        {message.errorDetail}
      </div>
    );
  };

  return (
    <div
      className={`cb-wrapper ${isUser ? 'cb-user' : 'cb-ai'}`}
      data-status={status}
      data-last={isLast || undefined}
    >
      <div className={`cb-bubble ${isUser ? 'cb-bubble-user' : 'cb-bubble-ai'} ${isError ? 'cb-bubble-error' : ''} ${isWaiting ? 'cb-bubble-waiting' : ''}`}>
        {/* 内容区域 — 当前为纯文本，后续替换为 <ReactMarkdown> */}
        <div className="cb-content">
          {isWaiting ? (
            <span className="cb-waiting-text">思考中...</span>
          ) : (
            <span className="cb-text">{content || ''}</span>
          )}
          {isStreaming && <span className="cb-cursor" />}
        </div>

        {/* 状态指示 */}
        {renderStatusIcon()}

        {/* 错误详情 */}
        {renderErrorDetail()}

        {/* 操作按钮 */}
        {renderActions()}
      </div>

      {/* 时间戳 */}
      {message.timestamp && !isWaiting && (
        <div className="cb-time">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}