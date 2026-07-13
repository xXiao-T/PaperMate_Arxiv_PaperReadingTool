/**
 * useChat.js — 对话状态管理 Hook
 * ────────────────────────────────────────
 * 职责：
 *   1. 管理消息列表（messages）的增删改
 *   2. 处理发送 / 重试 / 停止 / 清空操作
 *   3. 调用 aiService.streamChat 进行流式通信
 *   4. 自动注入论文上下文
 *   5. 暴露 loading / streaming / error 状态供 UI 消费
 *
 * 使用方式：
 *   const { messages, isStreaming, error, send, retry, stop, clear } =
 *     useChat({ paperContext });
 */

import { useState, useRef, useCallback } from 'react';
import { streamChat, createMessage, resolveCommand } from '../services/aiService';

export default function useChat({ paperContext } = {}) {
  // ---- 状态 ----
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  // ---- 内部 ref ----
  const currentAbortRef = useRef(null);
  // 当 streaming 时，承载 AI 回复的增量文本
  const streamingContentRef = useRef('');
  // 当前正在流式填充的消息索引
  const streamingIndexRef = useRef(-1);

  // ---- 辅助：获取要发送给 API 的纯数据消息（不含 status 等 UI 字段） ----
  const buildApiMessages = useCallback(
    (history, extraContent) => {
      const apiMsgs = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      if (extraContent) {
        apiMsgs.push({ role: 'user', content: extraContent });
      }
      return apiMsgs;
    },
    [],
  );

  // ---- 核心：发送消息 ----
  const send = useCallback(
    (userText) => {
      const trimmed = (userText || '').trim();
      if (!trimmed || isStreaming) return;

      // 清除旧错误
      setError(null);

      // 检查是否为系统指令，如果是则替换为增强 prompt
      const resolved = resolveCommand(trimmed);
      const actualPrompt = resolved.isCommand ? resolved.prompt : trimmed;

      // 创建用户消息
      const userMsg = createMessage('user', trimmed);
      // 对话历史用于 API（发送增强后的 prompt）
      const apiMessages = buildApiMessages(messages, actualPrompt);

      // 追加用户消息 + 占位 AI 消息
      const aiPlaceholder = createMessage('ai', '');
      aiPlaceholder.status = 'waiting';

      setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
      streamingContentRef.current = '';
      setIsStreaming(true);

      const aiIndex = messages.length + 1; // 新 ai 消息在新数组中的索引
      streamingIndexRef.current = aiIndex;

      // 发起流式请求
      const { abort } = streamChat({
        messages: apiMessages,
        paperContext,
        callbacks: {
          onToken: (token) => {
            streamingContentRef.current += token;
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[aiIndex]) {
                updated[aiIndex] = {
                  ...updated[aiIndex],
                  content: streamingContentRef.current,
                  status: 'streaming',
                };
              }
              return updated;
            });
          },
          onError: (err) => {
            setIsStreaming(false);
            setError(err.message || '未知错误');
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[aiIndex]) {
                updated[aiIndex] = {
                  ...updated[aiIndex],
                  content: updated[aiIndex].content || '',
                  status: 'error',
                  errorDetail: err.message,
                };
              }
              return updated;
            });
          },
          onComplete: () => {
            setIsStreaming(false);
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[aiIndex] && updated[aiIndex].status === 'streaming') {
                updated[aiIndex] = {
                  ...updated[aiIndex],
                  status: 'done',
                };
              }
              return updated;
            });
          },
        },
      });

      currentAbortRef.current = abort;
    },
    [messages, isStreaming, paperContext, buildApiMessages],
  );

  // ---- 重试最后一条失败消息 ----
  const retry = useCallback(() => {
    if (isStreaming) return;

    // 找到最后一条 AI 错误消息，移除它，重新发送上一条用户消息
    const lastAiIndex = messages
      .map((m, i) => (m.role === 'ai' && m.status === 'error' ? i : -1))
      .filter((i) => i >= 0)
      .pop();

    if (lastAiIndex === undefined || lastAiIndex < 0) return;

    // 找到它前面的用户消息
    const userMsg = messages[lastAiIndex - 1];
    if (!userMsg || userMsg.role !== 'user') return;

    // 移除这对消息
    const truncated = messages.slice(0, lastAiIndex - 1);
    setMessages(truncated);
    setError(null);

    // 重新发送（注意：此时 messages 还未更新，send 内部会用 truncated 状态）
    // send 依赖 messages state，我们无法直接传入截断后的数组，
    // 所以用 setTimeout 确保 state 更新后再发送
    setTimeout(() => {
      send(userMsg.content);
    }, 0);
  }, [messages, isStreaming, send]);

  // ---- 停止当前生成 ----
  const stop = useCallback(() => {
    if (currentAbortRef.current) {
      currentAbortRef.current();
      currentAbortRef.current = null;
    }
    setIsStreaming(false);
    // 将当前 streaming 消息标记为 done（保留已生成内容）
    setMessages((prev) => {
      const updated = [...prev];
      const idx = streamingIndexRef.current;
      if (idx >= 0 && updated[idx] && updated[idx].status === 'streaming') {
        updated[idx] = {
          ...updated[idx],
          status: 'done',
        };
      }
      return updated;
    });
    streamingContentRef.current = '';
    streamingIndexRef.current = -1;
  }, []);

  // ---- 清空对话 ----
  const clear = useCallback(() => {
    if (isStreaming) {
      stop();
    }
    setMessages([]);
    setError(null);
    streamingContentRef.current = '';
    streamingIndexRef.current = -1;
  }, [isStreaming, stop]);

  return {
    /** 消息列表 */
    messages,
    /** 是否正在流式接收 AI 回复 */
    isStreaming,
    /** 当前错误信息（null 表示无错误） */
    error,
    /** 发送消息 */
    send,
    /** 重试最后一条失败消息 */
    retry,
    /** 中止当前流式生成 */
    stop,
    /** 清空全部对话历史 */
    clear,
    /** 是否有消息（含 streaming 中） */
    hasMessages: messages.length > 0,
    /** 最后一条消息是否出错（用于显示重试按钮） */
    hasError: messages.some((m) => m.status === 'error'),
  };
}