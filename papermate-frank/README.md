# PaperMate - ArXiv论文阅读工具

PaperMate 是一个基于 Spring Boot + React 的 ArXiv 论文阅读与管理工具，提供论文抓取、结构化解析、知识检索和智能问答等功能。

## 功能特性

- **论文抓取与管理**：自动从 ArXiv 抓取论文元数据，支持批量导入
- **结构化解析**：自动分析论文内容，提取关键概念、总结、方法和结论
- **知识检索**：支持按关键词、作者、分类等多维度搜索论文
- **智能问答**：针对论文内容进行问答交互
- **个人笔记**：支持为论文添加个人笔记和批注

## 技术栈

### 后端
- Spring Boot 3.2.5
- Spring Data JPA
- MySQL 8.0+
- Java 21+

### 前端
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6
- Axios
- Lucide React Icons

## 环境要求

- JDK 26 或更高版本
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd arxiv-demo
```

### 2. 数据库配置

创建 MySQL 数据库：

```sql
CREATE DATABASE papermate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'papermate'@'localhost' IDENTIFIED BY 'papermate123';
GRANT ALL PRIVILEGES ON papermate_db.* TO 'papermate'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 后端启动

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动。

### 4. 前端启动

打开新的终端窗口：

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动。

## 项目结构

```
arxiv-demo/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/example/papermate/
│   │   ├── controller/         # REST API 控制器
│   │   ├── service/            # 业务逻辑层
│   │   ├── repository/         # 数据访问层
│   │   ├── entity/             # JPA 实体类
│   │   ├── dto/                # 数据传输对象
│   │   ├── config/             # 配置类
│   │   └── PaperMateApplication.java
│   ├── src/main/resources/
│   │   └── application.yml     # 应用配置
│   └── pom.xml
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/         # UI 组件
│   │   ├── pages/              # 页面组件
│   │   ├── services/           # API 服务
│   │   ├── App.jsx             # 主应用组件
│   │   ├── main.jsx            # 入口文件
│   │   └── index.css           # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## API 接口

### 论文管理
- `GET /api/v1/papers` - 获取所有论文
- `GET /api/v1/papers/recent` - 获取最近论文
- `GET /api/v1/papers/{id}` - 获取单篇论文
- `POST /api/v1/papers/fetch` - 抓取新论文
- `POST /api/v1/papers/batch-fetch` - 批量抓取论文

### 搜索功能
- `GET /api/v1/search/keyword?keyword=xxx` - 关键词搜索
- `GET /api/v1/search/author?author=xxx` - 作者搜索
- `GET /api/v1/search/category?category=xxx` - 分类搜索

### 分析功能
- `POST /api/v1/analysis/{paperId}` - 分析论文
- `GET /api/v1/analysis/concepts/{paperId}` - 获取论文概念

### 智能问答
- `POST /api/v1/qa` - 提问

### 笔记管理
- `POST /api/v1/notes` - 创建笔记
- `GET /api/v1/notes/paper/{paperId}` - 获取论文笔记
- `PUT /api/v1/notes/{noteId}` - 更新笔记
- `DELETE /api/v1/notes/{noteId}` - 删除笔记

## 使用说明

1. **抓取论文**：在首页点击"抓取新论文"，输入 ArXiv ID（如 `2301.00001`）即可抓取论文
2. **浏览论文**：在论文列表中点击论文卡片查看详情
3. **搜索论文**：使用顶部搜索栏按关键词搜索
4. **智能问答**：在论文详情页的问答区域输入问题
5. **添加笔记**：在论文详情页添加个人笔记

## 配置说明

后端配置文件：`backend/src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/papermate_db?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: papermate
    password: papermate123
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

## 开发模式

### 后端热重载

后端使用 Spring DevTools，代码修改后会自动重新加载。

### 前端热重载

前端使用 Vite，代码修改后会自动刷新浏览器。

## 生产构建

### 后端打包

```bash
cd backend
mvn clean package
java -jar target/papermate-1.0.0.jar
```

### 前端构建

```bash
cd frontend
npm run build
```

构建产物位于 `frontend/dist` 目录。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！