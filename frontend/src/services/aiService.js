/**
 * aiService.js — AI 对话 API 通信服务
 * ────────────────────────────────────────
 * 封装所有与大模型交互的网络请求，支持：
 *   - SSE 流式对话（Chat Completions stream: true）
 *   - 请求中断（AbortController）
 *   - 超时 & 自动重试
 *   - 论文上下文自动注入
 *
 * 核心依赖：src/config/aiConfig.js 中的全局配置
 */

import aiConfig from '../config/aiConfig';

// ============================================================
//  工具函数
// ============================================================

/** 生成 UUID v4（轻量实现，避免额外依赖） */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 构建 OpenAI 兼容的 Chat Completions 请求体 */
function buildRequestBody({ messages, systemPrompt, paperContext }) {
  const systemContent = buildSystemContent(systemPrompt, paperContext);

  return {
    model: aiConfig.model,
    messages: [{ role: 'system', content: systemContent }, ...messages],
    temperature: aiConfig.temperature,
    max_tokens: aiConfig.maxTokens,
    top_p: aiConfig.topP,
    stream: aiConfig.streamEnabled,
  };
}

/** 构建带有论文上下文的 system 消息 */
function buildSystemContent(systemPrompt, paperContext) {
  let content = systemPrompt || aiConfig.systemPrompt;

  if (paperContext) {
    content += `\n\n【当前阅读文献信息】\n`;

    if (paperContext.primary) {
      const p = paperContext.primary;
      content += `📄 主文献：${p.title}\n`;
      if (p.authors) content += `   作者：${p.authors}\n`;
      if (p.publishedAt) content += `   发表时间：${p.publishedAt}\n`;
      if (p.tags?.length) content += `   标签：${p.tags.join('、')}\n`;
      if (p.abstract && p.abstract !== '1') {
        const truncated =
          p.abstract.length > aiConfig.paperAbstractMaxLength
            ? p.abstract.slice(0, aiConfig.paperAbstractMaxLength) + '...'
            : p.abstract;
        content += `   摘要：${truncated}\n`;
      }
      if (p.rawText) {
        const max = aiConfig.paperAbstractMaxLength * 2;
        const truncated = p.rawText.length > max
          ? p.rawText.slice(0, max) + '\n...[原文截断]'
          : p.rawText;
        content += `\n📄 原文正文（前若干页）：\n${truncated}\n`;
      }
    }

    if (paperContext.secondary) {
      const s = paperContext.secondary;
      content += `\n📄 对比文献：${s.title}\n`;
      if (s.authors) content += `   作者：${s.authors}\n`;
      if (s.publishedAt) content += `   发表时间：${s.publishedAt}\n`;
      if (s.tags?.length) content += `   标签：${s.tags.join('、')}\n`;
      if (s.abstract && s.abstract !== '1') {
        const truncated =
          s.abstract.length > aiConfig.paperAbstractMaxLength
            ? s.abstract.slice(0, aiConfig.paperAbstractMaxLength) + '...'
            : s.abstract;
        content += `   摘要：${truncated}\n`;
      }
      if (s.rawText) {
        const max = aiConfig.paperAbstractMaxLength * 2;
        const truncated = s.rawText.length > max
          ? s.rawText.slice(0, max) + '\n...[原文截断]'
          : s.rawText;
        content += `\n📄 对比文献正文（前若干页）：\n${truncated}\n`;
      }
    }
  }

  return content;
}

/** 构建请求 headers */
function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${aiConfig.apiKey}`,
  };
}

// ============================================================
//  SSE 流式解析器
// ============================================================

/**
 * 解析 SSE data: 行，返回解析后的 JSON 对象 或 null
 * SSE 格式示例：
 *   data: {"id":"...","object":"chat.completion.chunk","choices":[{"delta":{"content":"你好"}}]}
 *   data: [DONE]
 */
function parseSSELine(line) {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6).trim();
  if (data === '[DONE]') return { done: true };
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/** 从 SSE chunk 中提取增量文本内容 */
function extractDeltaContent(parsed) {
  if (!parsed || parsed.done) return null;
  const choice = parsed.choices?.[0];
  if (!choice) return null;
  return choice.delta?.content ?? null;
}

// ============================================================
//  核心 API：流式聊天
// ============================================================

/**
 * streamChat — 发起流式对话请求
 *
 * @param {Object} params
 * @param {Array}  params.messages     - 历史消息 [{ role, content }]
 * @param {Object} params.paperContext - 论文上下文 { primary: {...}, secondary?: {...} }
 * @param {Object} params.callbacks
 * @param {Function} params.callbacks.onToken    - 收到新 token (string)
 * @param {Function} params.callbacks.onError    - 发生错误 (Error)
 * @param {Function} params.callbacks.onComplete - 流结束 ()
 * @param {AbortSignal} [params.signal]          - 中断信号
 * @returns {Object} { abort: Function }  用于外部取消请求
 */
export function streamChat({ messages, paperContext, callbacks, signal }) {
  const { onToken, onError, onComplete } = callbacks;

  // 合并外部 signal 与内部超时 abort
  const abortController = new AbortController();
  const localSignal = abortController.signal;

  // 超时定时器
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, aiConfig.timeout);

  // 如果外部传了 signal，联动中断
  if (signal) {
    signal.addEventListener('abort', () => abortController.abort());
  }

  // 监听本地 abort（含超时）以联动外部 signal 的 abort 事件
  localSignal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  const requestBody = buildRequestBody({
    messages,
    systemPrompt: aiConfig.systemPrompt,
    paperContext,
  });

  const url = `${aiConfig.baseURL}/chat/completions`;

  fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(requestBody),
    signal: localSignal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        let errorMessage;
        switch (response.status) {
          case 401:
            errorMessage = 'API Key 无效或未配置，请检查 .env 文件中的 REACT_APP_AI_API_KEY';
            break;
          case 402:
            errorMessage = '账户余额不足，请前往 DeepSeek 平台充值';
            break;
          case 429:
            errorMessage = '请求频率过高，请稍后重试';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'AI 服务暂时不可用，请稍后重试';
            break;
          default:
            errorMessage = `请求失败 (HTTP ${response.status}): ${errorBody}`;
        }
        throw new Error(errorMessage);
      }

      // 读取 SSE 流
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 按行分割，处理完整的 SSE lines
        const lines = buffer.split('\n');
        // 最后一个可能是不完整的行，保留回 buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const parsed = parseSSELine(trimmed);
          if (!parsed) continue;

          if (parsed.done) {
            clearTimeout(timeoutId);
            onComplete?.();
            return;
          }

          const content = extractDeltaContent(parsed);
          if (content) {
            onToken(content);
          }
        }
      }

      // 流读取结束但未收到 [DONE]
      clearTimeout(timeoutId);
      onComplete?.();
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        // 用户主动取消或超时，不视为错误
        onComplete?.();
        return;
      }
      onError?.(error);
    });

  return {
    /** 中止当前请求 */
    abort: () => abortController.abort(),
  };
}

// ============================================================
//  便捷方法：非流式（fallback）
// ============================================================

/**
 * chat — 非流式对话请求（禁用 stream）
 * 当 SSE 不可用时作为降级方案
 */
export async function chat({ messages, paperContext }) {
  const requestBody = buildRequestBody({
    messages,
    systemPrompt: aiConfig.systemPrompt,
    paperContext,
  });
  requestBody.stream = false;

  const url = `${aiConfig.baseURL}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(aiConfig.timeout),
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败 (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ============================================================
//  消息构建工具
// ============================================================

/**
 * createMessage — 创建一条标准消息对象
 * @param {'user'|'ai'|'system'} role
 * @param {string} content
 * @returns {Object} { id, role, content, timestamp, status }
 */
export function createMessage(role, content) {
  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    status: role === 'ai' ? 'waiting' : 'done',
  };
}

/**
 * 指令映射表 — 系统命令 → 对应的提示词前缀
 * 发送给 AI 时会自动拼接论文上下文
 */
export const COMMAND_PROMPTS = {
  '/analyze': `请对当前论文进行全面深入的分析，包括：

1. **研究背景与动机**：本文要解决什么问题？为什么重要？
2. **核心方法**：提出了什么方法/模型/框架？技术路线是什么？
3. **关键创新点**：与已有工作相比，最大创新或贡献是什么？
4. **实验与评估**：在哪些数据集上验证？主要指标如何？
5. **局限性与展望**：论文自身承认的不足？未来方向？

请用 Markdown 格式组织，引用原文时注明章节。`,

  '/compare': `请从以下维度横向对比主文献与对比文献：

| 维度 | 主文献 | 对比文献 |
|------|--------|----------|
| 研究问题 | | |
| 核心方法 | | |
| 实验设置 | | |
| 关键指标 | | |
| 创新程度 | | |
| 局限性 | | |

然后给出综合评述与建议（哪个更值得精读？如何互补阅读？）。`,
};

/**
 * resolveCommand — 解析用户输入是否为系统指令
 * @param {string} text - 用户输入文本
 * @returns {{ isCommand: boolean, command?: string, prompt?: string }}
 */
export function resolveCommand(text) {
  const trimmed = text.trim();
  if (COMMAND_PROMPTS[trimmed]) {
    return {
      isCommand: true,
      command: trimmed,
      prompt: COMMAND_PROMPTS[trimmed],
    };
  }
  return { isCommand: false };
}

export default {
  streamChat,
  chat,
  createMessage,
  resolveCommand,
  COMMAND_PROMPTS,
};