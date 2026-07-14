数据库表

| # | 表名 | 模块 | 说明 |
|---|------|------|------|
| 1 | users | auth | 用户 |
| 2 | papers | paper | 论文元数据 |
| 3 | tags | tag | 标签字典 |
| 4 | paper_tags | tag | 论文-标签关联 |
| 5 | user_papers | library | 用户收藏+星标 |
| 6 | comments | comment | 论文评论 |
| 7 | reading_progress | reader | 阅读进度 |
| 8 | paper_annotations | note | 文段批注（含偏移量） |
| 9 | chat_messages | ai | AI 对话消息 |
| 10 | fetch_tasks | fetch | 定时抓取任务 |
| 11 | learning_stats | learning | 每日阅读统计 |

JPA `ddl-auto: update` 启动自动建表，无需手动执行 SQL。

---

## 全部 API 端点

### auth — 用户认证

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 否 |
| POST | /api/auth/login | 登录，返回 JWT | 否 |
| GET | /api/auth/me | 获取当前用户信息 | 是 |

### paper — 论文核心

| 方法 | 路径 | 参数 | 说明 |
|------|------|------|------|
| GET | /api/papers | keyword, tag, page, pageSize | 搜索论文（分页） |
| GET | /api/papers/{id} | — | 论文详情（含收藏状态） |
| POST | /api/papers | JSON body | 手动导入论文 |

**搜索返回格式**（GET /api/papers）:
```
data: {
  list: [{ id, title, authors, publishedAt, tags: [...], paperAbstract, arxivUrl, favorited, starred }],
  total, page, pageSize
}
```

**导入请求体**（POST /api/papers）:
```json
{
  "title": "Attention Is All You Need",
  "authors": "Vaswani et al.",
  "paperAbstract": "...",
  "category": "cs.CL",
  "publishedAt": "2017-06-12",
  "arxivUrl": "https://arxiv.org/abs/1706.03762",
  "tags": "NLP,Transformer"
}
```

### tag — 标签

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tags | 获取所有标签（含论文数） |
| POST | /api/tags?name=xxx | 创建标签 |
| DELETE | /api/tags/{id} | 删除标签（级联删关联） |
| GET | /api/papers/{paperId}/tags | 获取论文的标签 |
| POST | /api/papers/{paperId}/tags?tagId=xxx | 给论文加标签（幂等） |
| DELETE | /api/papers/{paperId}/tags/{tagId} | 移除论文标签 |

### library — 个人文库（待实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/library/favorites | 获取收藏列表 |
| POST | /api/library/favorites | 收藏论文 (body: {paperId}) |
| DELETE | /api/library/favorites/{paperId} | 取消收藏 |
| POST | /api/library/stars | 切换星标 (body: {paperId}) |

### comment — 论文评论（待实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/papers/{paperId}/comments | 获取所有评论 |
| POST | /api/papers/{paperId}/comments | 新建评论 |
| PUT | /api/papers/{paperId}/comments/{id} | 修改评论（作者校验） |
| DELETE | /api/papers/{paperId}/comments/{id} | 删除评论（作者校验） |

**CommentDTO**: id, content, userId, username, createdAt

### reader — 阅读进度（待实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/papers/{paperId}/progress | 获取阅读进度 |
| POST | /api/papers/{paperId}/progress | 保存/更新进度 (upsert) |

**ProgressDTO**: id, currentPage, totalPages, completed

### note — 文段批注（待实现，★ 重点模块）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/papers/{paperId}/annotations | 获取所有批注（按页+偏移排序） |
| POST | /api/papers/{paperId}/annotations | 创建批注 |
| PUT | /api/papers/{paperId}/annotations/{id} | 更新批注（部分字段 merge） |
| DELETE | /api/papers/{paperId}/annotations/{id} | 删除批注 |

**Annotation 字段**:
```
pageIndex      int      — 页码（0 起始）
startOffset    int      — 选中原文起始字符偏移
endOffset      int      — 选中原文结束字符偏移
selectedText   TEXT     — 被标注的原始文本
commentText    TEXT     — 用户的批注内容（纯高亮时为 null）
annotationType String   — highlight | underline | comment | note
color          String   — 高亮颜色 hex，如 "#FFD700"
```

> **note 和 comment 的区别**: comment 是"这篇论文整体不错"（绑论文，不绑位置），note 是"第3页 offset 234-254 的 'attention mechanism' 是关键"（绑论文+绑位置+绑原文）。

### ai — AI 对话（待实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/papers/{paperId}/chat | 获取聊天历史 |
| POST | /api/papers/{paperId}/chat | 保存一条消息（前端直连模式） |
| DELETE | /api/papers/{paperId}/chat | 清空对话记录 |
| POST | /api/ai/chat | 发消息+获取 AI 回复（后端代理） |
| POST | /api/ai/proxy | SSE 流式代理到 LLM |

### fetch — 定时抓取（待实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/fetch/tasks | 获取所有抓取任务 |
| POST | /api/fetch/tasks | 创建任务 |
| PUT | /api/fetch/tasks/{id} | 编辑任务 |
| DELETE | /api/fetch/tasks/{id} | 删除任务 |
| POST | /api/fetch/tasks/{id}/run | 立即执行一次 |
| PUT | /api/fetch/tasks/{id}/status | 切换 active/paused |

### learning — 学习管理（待实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/learning/stats | 本周/本月/总计阅读时长 |
| GET | /api/learning/records | 阅读记录列表（period=weekly/monthly/all） |
| POST | /api/learning/knowledge-graph | 生成知识图谱（tags 聚类） |

---

## 核心 Entity 字段（全局约定，不可随意改）

### Paper（所有模块的基础依赖）

| 字段 | Java 类型 | DB 类型 | 说明 |
|------|-----------|---------|------|
| id | Long | BIGINT PK | 自增 |
| title | String | TEXT NOT NULL | 论文标题 |
| authors | String | TEXT NOT NULL | 作者（逗号分隔或原文格式） |
| paperAbstract | String | TEXT | 摘要 |
| category | String | VARCHAR(128) | 分类 |
| publishedAt | LocalDate | DATE | 发布日期 |
| arxivUrl | String | TEXT | arXiv 原文链接 |
| tags | String | TEXT | 逗号分隔标签 |
| pdfPath | String | VARCHAR(255) | PDF 文件路径 |
| createdAt | LocalDateTime | DATETIME | 自动生成 |

### UserPaper（用户-论文关联）

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | Long NOT NULL | 用户 ID |
| paperId | Long NOT NULL | 论文 ID |
| favorited | Boolean | 是否收藏（默认 true） |
| starred | Boolean | 是否星标（默认 false） |
| importedAt | LocalDateTime | 导入时间 |

唯一约束: (userId, paperId)

---

## 代码规范

### Controller

- 所有返回值统一包 `Result<T>`: `Result.success(data)`, `Result.error(400, "msg")`
- 请求体 DTO 加 `@Valid` 做参数校验
- `Result.success()` 返回 `code=200`
- 通过 `SecurityContextHolder` 获取当前用户，principal 类型是 `User` 对象:

```java
private Long getCurrentUserId() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) return null;
    if (auth.getPrincipal() instanceof User user) return user.getId();
    if (auth.getPrincipal() instanceof Long id) return id;
    return null;
}
```

### DTO / VO 命名

```
XxxRequest    → 请求入参（如 PaperImportRequest, RegisterRequest）
XxxDTO        → 列表项（如 PaperDTO, TagDTO）
XxxVO         → 详情/返回值（如 PaperDetailVO, LoginVO）
```

### Service

- 模块间调用走 Service，**禁止**跨模块直接调 Repository
- 返回给 Controller 的是 DTO/VO，**不暴露 Entity**
- 批量查询用 `findByXxxIn()` 防盗 N+1 查询（参考 PaperService.search）

### Entity

- 统一用 Lombok: `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`
- `createdAt` 用 `@PrePersist` 自动设置
- DB 字段用下划线映射: `@Column(name = "paper_abstract")`
- 所有 Entity 放各自模块的 `entity/` 目录

### URL 风格

```
/api/{模块名}/{资源}          # 小写、名词复数、连字符
例: /api/papers/{paperId}/tags
```

---

## 模块依赖关系

```
                    auth (无依赖，最先做)
                       │
         ┌─────────────┼─────────────┐
        tag           paper         library
     (需 paper     (★ 核心模块)    (需 paper
      Entity)      (无依赖)        Entity)
         │              │              │
         └──────────────┼──────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     comment         reader           note
   (需 paper        (需 paper       (需 paper
    Entity)          Entity)         Entity)
                        │
              ┌─────────┴─────────┐
              │                   │
            ai                 fetch
         (需 paper           (需 paper
          Entity)          Entity+Service)
                            │
                        learning
                       (需 library
                         数据)
```

> **paper 是核心**: paper 的 Entity 写好后，其余 8 个模块可并行开发，因为只需引用 Paper 类。

---

## 关键约定

### JWT 认证

- Token 生成 subject = **email**（不是 userId）
- `JwtAuthFilter` 通过 email 查 `UserRepository`，principal 设为 `User` 对象
- 公开路由: `/api/auth/register`, `/api/auth/login`, `/api/papers/**`, `/uploads/**`
- `application-dev.yml` 必须配置:
```yaml
jwt:
  secret: <密钥>
  expiration: 86400000
```

### Result 返回码

| 场景 | code |
|------|------|
| 成功 | 200 |
| 参数校验失败 | 400 |
| 未认证 | 401 |
| 无权限 | 403 |
| 服务器错误 | 500 |

前端 `apiFetch` 检查 `code !== 200 && code !== 0` 才算失败。

### 注册密码规则

- 长度 8-128 位
- 必须同时包含字母和数字
- 需要 `confirmPassword` 字段

### tags 处理

- Paper 表有 `tags TEXT` 字段（逗号分隔，向后兼容）
- Tag 模块有独立的 `tags` + `paper_tags` 关联表（推荐方式，支持级联删除）
- PaperDTO 返回时自动把逗号串拆成 `List<String>`

---

## 开发前检查清单

- [ ] `pom.xml` 有 Lombok 依赖
- [ ] `application-dev.yml` 有 `jwt.secret` 和 `jwt.expiration`
- [ ] 0 字节空 Java 文件已删除（否则 javac 报 "file does not contain class"）
- [ ] 返回值用 `Result<T>` 包裹
- [ ] 获取当前用户做了 null 保护
- [ ] 前端 `apiFetch` 接受 code=200
- [ ] 跨模块调用走 Service，不直接调 Repository
- [ ] 不修改其他模块的 Entity 字段

---

## 本地启动

```bash
# 后端（MySQL 需运行，数据库 papermate 已创建）
cd backend
mvn spring-boot:run     # 端口 8080

# 前端
cd frontend
npm install
npm start               # 端口 3000
