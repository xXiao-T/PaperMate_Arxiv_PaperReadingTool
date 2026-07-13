# PaperMate Frontend

PaperMate 是一款面向研究人员的 arXiv 论文阅读与管理工具，支持 PDF 阅读、记笔记、文献管理以及 **AI 辅助论文分析**。

本仓库为前端项目，基于 React 18 + React Router 构建。

---

## 目录结构

```
frontend/
├── public/                        # 静态资源
├── src/
│   ├── config/
│   │   └── aiConfig.js            # AI 模型配置（服务商 / 密钥 / 参数）
│   ├── components/
│   │   ├── ChatBubble/            # 消息气泡组件（通用）
│   │   │   ├── ChatBubble.jsx
│   │   │   └── ChatBubble.css
│   │   └── Sidebar/               # 侧边导航栏
│   │       ├── Sidebar.jsx
│   │       └── Sidebar.css
│   ├── hooks/
│   │   └── useChat.js             # AI 对话状态管理 Hook
│   ├── services/
│   │   └── aiService.js           # AI API 通信服务（SSE 流式）
│   ├── layouts/
│   │   └── MainLayout.jsx         # 主布局壳（侧边栏 + 内容区）
│   ├── pages/
│   │   ├── Auth/                  # 登录 / 注册 / 找回密码
│   │   ├── Search/                # arXiv 论文搜索
│   │   ├── Library/               # 文献库管理
│   │   ├── PaperDetail/           # 论文详情页
│   │   ├── Reader/                # 论文阅读页（PDF + 笔记 + AI 对话）
│   │   │   ├── Reader.jsx
│   │   │   ├── Reader.css
│   │   │   ├── ReaderAIPanel.jsx  # AI 对话面板
│   │   │   ├── ReaderAIPanel.css
│   │   │   └── QuickActions.jsx   # 快捷指令按钮组
│   │   ├── Learning/              # 学习管理
│   │   └── AutoFetch/             # 自动抓取配置
│   ├── styles/
│   │   └── index.css              # 全局样式 & 设计系统
│   ├── App.jsx                    # 路由入口
│   └── index.jsx                  # 应用挂载点
├── .env.example                   # 环境变量配置模板
├── .gitignore                     # Git 忽略规则
├── package.json
└── README.md                      # 本文件
```

---

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置 AI 对话

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 AI 服务商信息。**以下以 DeepSeek 开放平台为例：**

```env
# 前往 https://platform.deepseek.com/api_keys 创建 API Key
REACT_APP_AI_PROVIDER=deepseek
REACT_APP_AI_BASE_URL=https://api.deepseek.com
REACT_APP_AI_API_KEY=sk-your-deepseek-api-key-here

# 模型选择（V4 最新模型）
# deepseek-v4-flash → 快速推理（日常使用）
# deepseek-v4-pro   → 旗舰专业版（推荐论文场景）
# 注意：deepseek-chat / deepseek-reasoner 将于 2026/07/24 弃用
REACT_APP_AI_MODEL=deepseek-v4-pro
REACT_APP_AI_TEMPERATURE=0.5
REACT_APP_AI_MAX_TOKENS=4096
```

> ⚠️ `.env` 文件已被 `.gitignore` 排除，不会被提交到版本控制。
> 如果未创建 `.env`，`aiConfig.js` 中的默认占位值会导致 API 调用失败。

其他兼容 OpenAI Chat Completions 风格 API 的服务商（智谱、Moonshot、OpenAI 等）同样支持，只需修改 `REACT_APP_AI_BASE_URL` 和 `REACT_APP_AI_MODEL`。

### 3. 启动开发服务器

```bash
npm start
```

浏览器访问 `http://localhost:3000`。

### 4. 生产构建

```bash
npm run build
```

构建产物输出到 `build/` 目录。

---

## AI 对话功能说明

### 架构总览

```
Reader.jsx (页面容器)
  └─→ useChat Hook (状态管理)
        └─→ aiService.streamChat() (SSE 流式请求)
              └─→ DeepSeek / OpenAI API
```

### 消息状态

| 状态 | 说明 | UI 表现 |
|------|------|---------|
| `waiting` | 等待 API 首个响应 | 旋转加载动画 + "思考中..." |
| `streaming` | 正在逐 token 接收 | 文本渐进展示 + 闪烁光标 |
| `done` | 生成完成 | 常态展示，可复制/下载 |
| `error` | 请求失败 | 红色边框 + 错误详情 + 重试按钮 |

### 快捷指令

在阅读界面输入以下指令即可触发增强分析，**论文上下文（标题、作者、摘要）会自动注入**：

| 指令 | 功能 | 双列模式必需 |
|------|------|:---:|
| `/analyze` | 分析论文结构、方法、创新、局限 | - |
| `/summarize` | 生成 400 字以内中文摘要 | - |
| `/explain` | 通俗解释核心概念和技术细节 | - |
| `/translate` | 翻译选段为自然学术中文 | - |
| `/quiz` | 生成 5 道阅读理解选择题 | - |
| `/compare` | 横向对比两篇论文 | ✓ |

也可直接输入自然语言自由提问。

### 论文上下文自动注入

每次请求 AI 时，系统会自动拼装当前阅读的论文信息到 `system` 消息中，包括标题、作者、发表时间、标签、摘要（限 `REACT_APP_AI_PAPER_ABSTRACT_MAX_LEN` 字符）。AI 无需用户手动粘贴即可理解上下文。

---

## 配置参考

完整配置项见 [.env.example](.env.example) 或 `src/config/aiConfig.js` 中的注释。

### 核心环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `REACT_APP_AI_PROVIDER` | `deepseek` | 服务商标识 |
| `REACT_APP_AI_BASE_URL` | `https://api.deepseek.com` | API 基础地址 |
| `REACT_APP_AI_API_KEY` | — | **必填**，API 鉴权密钥 |
| `REACT_APP_AI_MODEL` | `deepseek-v4-pro` | 模型名称（V4 旗舰） |
| `REACT_APP_AI_TEMPERATURE` | `0.5` | 生成温度 (0~2) |
| `REACT_APP_AI_MAX_TOKENS` | `4096` | 单次回复最大 token |
| `REACT_APP_AI_TIMEOUT` | `60000` | 请求超时（毫秒） |
| `REACT_APP_AI_STREAM_ENABLED` | `true` | 是否启用流式输出 |

### 系统提示词

可通过 `REACT_APP_AI_SYSTEM_PROMPT` 自定义 AI 的人设与行为。留空则使用默认的学术论文审阅助手提示词。

---

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 18 |
| 路由 | React Router v6 |
| 图标 | Lucide React |
| 构建 | Create React App (react-scripts) |
| AI 通信 | Fetch API + SSE (ReadableStream) |
| 样式 | CSS（无 CSS-in-JS 库） |