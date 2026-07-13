/**
 * PaperMate AI 对话配置
 * ────────────────────────────────────────
 * 集中管理 AI 服务商、模型、API Key 等参数。
 * 所有配置项均通过环境变量或下方的默认值注入，
 * 切换到不同服务商只需修改本文件。
 *
 * 💡 建议通过项目根目录下的 .env 文件配置，
 *    参考 .env.example 模板（以 DeepSeek 开放平台为例）。
 */

const aiConfig = {
  // ─────────────────────────────────────────
  //  1. 服务商 & 端点
  // ─────────────────────────────────────────
  /**
   * provider: 当前使用的 AI 服务商
   * 可选值: 'deepseek' | 'openai' | 'azure' | 'gemini' | 'zhipu' | 'moonshot' | 'custom'
   */
  provider: process.env.REACT_APP_AI_PROVIDER || 'deepseek',

  /**
   * baseURL: API 基础地址
   *
   * 示例：
   *   DeepSeek 开放平台:  https://api.deepseek.com
   *   OpenAI 官方:        https://api.openai.com/v1
   *   智谱 GLM:           https://open.bigmodel.cn/api/paas/v4
   *   Moonshot:           https://api.moonshot.cn/v1
   *   自定义代理:          http://localhost:8080/v1
   */
  baseURL: process.env.REACT_APP_AI_BASE_URL || 'https://api.deepseek.com',

  /**
   * apiKey: 鉴权密钥
   *
   * 示例：
   *   DeepSeek 平台 → 控制台 → API Keys → 创建并复制
   *   格式: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   *
   * ⚠️ 请通过 .env 文件设置 REACT_APP_AI_API_KEY，
   *    不要把真实 Key 硬编码在这里。
   */
  apiKey: process.env.REACT_APP_AI_API_KEY || 'sk-your-deepseek-api-key-here',

  // ─────────────────────────────────────────
  //  2. 模型参数
  // ─────────────────────────────────────────
  /**
   * model: 对话模型名称
   *
   * DeepSeek 平台 V4 模型（当前最新）:
   *   deepseek-v4-flash → 快速推理（推荐日常使用）
   *   deepseek-v4-pro   → 旗舰专业版（深度推理与分析）
   *
   * 历史兼容（将于 2026/07/24 弃用）:
   *   deepseek-chat     → 等同于 v4-flash 非思考模式
   *   deepseek-reasoner  → 等同于 v4-flash 思考模式
   *
   * 其他服务商参考:
   *   OpenAI:        gpt-4o / gpt-4o-mini / gpt-4-turbo
   *   智谱:           glm-4-plus / glm-4-flash
   *   Moonshot:      moonshot-v1-8k / moonshot-v1-32k
   */
  model: process.env.REACT_APP_AI_MODEL || 'deepseek-v4-pro',

  /**
   * temperature: 生成温度 (0~2)，越高越随机
   * DeepSeek 官方建议论文分析场景使用 0.3~0.7
   */
  temperature: parseFloat(process.env.REACT_APP_AI_TEMPERATURE || '0.5'),

  /**
   * maxTokens: 单次回复最大 token 数
   * DeepSeek-V4 单次最大输出 8K tokens，这里默认 4096
   */
  maxTokens: parseInt(process.env.REACT_APP_AI_MAX_TOKENS || '4096', 10),

  /**
   * topP: 核采样参数 (0~1)
   */
  topP: parseFloat(process.env.REACT_APP_AI_TOP_P || '0.95'),

  // ─────────────────────────────────────────
  //  3. 请求行为
  // ─────────────────────────────────────────
  /**
   * timeout: 单次请求超时时间（毫秒）
   * DeepSeek 生成速度较快，60s 足够长文本输出
   */
  timeout: parseInt(process.env.REACT_APP_AI_TIMEOUT || '60000', 10),

  /**
   * maxRetries: 失败后最大重试次数
   * 遇到 429 (Rate Limit) 或 5xx 时自动重试
   */
  maxRetries: parseInt(process.env.REACT_APP_AI_MAX_RETRIES || '2', 10),

  /**
   * systemPrompt: 全局系统提示词（论文助手人设）
   * 可通过环境变量 REACT_APP_AI_SYSTEM_PROMPT 覆盖
   */
  systemPrompt: process.env.REACT_APP_AI_SYSTEM_PROMPT ||
    `你是一位资深学术论文审阅助手，精通机器学习、自然语言处理、计算机视觉等计算机科学领域。
你的职责是帮助研究人员：
- 精读与分析学术论文
- 用中文清晰地解释复杂概念
- 对比不同论文的方法与贡献
- 生成结构化摘要、关键问题、创新点总结
- 翻译段落与术语
回答要求：
- 使用 Markdown 格式，包含标题、列表、表格等
- 数学公式使用 LaTeX 语法（$...$ 行内，$$...$$ 块级）
- 引用原文时注明章节或段落位置
- 保持学术严谨但通俗易懂`,

  // ─────────────────────────────────────────
  //  4. 上下文窗口配置
  // ─────────────────────────────────────────
  /**
   * maxContextMessages: 携带的历史消息条数上限
   * DeepSeek-V4 上下文窗口 128K tokens，足够长对话
   */
  maxContextMessages: parseInt(process.env.REACT_APP_AI_MAX_CONTEXT || '20', 10),

  /**
   * paperAbstractMaxLength: 注入的论文摘要最大字符数
   */
  paperAbstractMaxLength: parseInt(process.env.REACT_APP_AI_PAPER_ABSTRACT_MAX_LEN || '2000', 10),

  // ─────────────────────────────────────────
  //  5. 流式输出 (SSE)
  // ─────────────────────────────────────────
  /**
   * streamEnabled: 是否启用流式输出
   * DeepSeek API 支持 SSE (stream: true)，逐 token 返回
   */
  streamEnabled: process.env.REACT_APP_AI_STREAM_ENABLED !== 'false',

  /**
   * streamChunkDelay: 模拟流式时每个 chunk 之间的延迟（ms）
   * 仅当后端不支持 SSE 时用作 fallback
   */
  streamChunkDelay: parseInt(process.env.REACT_APP_AI_STREAM_CHUNK_DELAY || '30', 10),
};

export default aiConfig;