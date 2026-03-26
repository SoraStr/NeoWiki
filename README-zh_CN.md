# NeoWiki

一个现代化的开源维基百科系统，使用 Node.js、Express.js 和 Markdown 构建。

![许可证](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![Express](https://img.shields.io/badge/express-%5E4.18.2-orange.svg)

## 功能特点

- **Markdown 编辑器** - 支持实时预览的富文本 Markdown 编辑器
- **用户认证** - 使用 bcrypt 密码加密的安全注册和登录系统
- **主题系统** - 8 种精美主题，包含深色、浅色、赛博朋克、森林等
- **标签系统** - 使用彩色标签整理文章
- **搜索功能** - 全文章全文搜索
- **响应式设计** - 移动端友好的现代化界面
- **图片支持** - 上传并在文章中显示图片
- **外部数据库** - 通过 REST API 灵活集成数据库

## 技术栈

- **后端**: Node.js, Express.js
- **前端**: 原生 JavaScript, HTML5, CSS3
- **认证**: Express Session, bcryptjs
- **数据库**: 外部 REST API 集成
- **Markdown**: 自定义 MDParser 解析库

## 项目结构

```
NeoWiki/
├── src/
│   ├── server.js          # Express 主服务器
│   ├── config.js          # 配置管理
│   ├── database.js        # 数据库 API 集成
│   ├── middleware/
│   │   └── auth.js        # 认证中间件
│   └── routes/
│       ├── api.js         # 通用 API 路由
│       ├── articles.js     # 文章 CRUD 操作
│       └── users.js       # 用户管理
├── public/
│   ├── index.html         # 落地页
│   ├── home.html          # 主页（文章列表）
│   ├── article.html       # 文章查看器
│   ├── editor.html        # Markdown 编辑器
│   ├── search.html        # 搜索页面
│   ├── login.html         # 登录页面
│   ├── register.html      # 注册页面
│   ├── admin.html         # 管理后台
│   ├── settings.html       # 用户设置
│   ├── user.html          # 用户资料
│   ├── css/
│   │   └── style.css      # 全局样式
│   ├── js/
│   │   ├── api.js         # API 客户端
│   │   ├── components.js  # 可复用 UI 组件
│   │   ├── theme.js       # 主题管理
│   │   └── wiki-settings.js # 维基配置
│   └── lib/
│       ├── MDParser.js    # Markdown 解析器
│       ├── editor-app.js  # 编辑器功能
│       └── editor-styles.css # 编辑器样式
├── uploads/                # 用户上传文件
├── package.json
└── .env.example
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/SoraStr/NeoWiki.git
cd NeoWiki
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填写你的数据库 API 地址
```

4. 启动服务器：
```bash
npm start
```

5. 打开浏览器访问 `http://localhost:3000`

### 首次设置

首次运行时，系统会提示你：
1. 设置维基名称和简介
2. 创建管理员账户

## 配置说明

### 环境变量

在项目根目录创建 `.env` 文件：

```env
PORT=3000
DATABASE_API_URL=https://your-database-api.com
SESSION_SECRET=your-secret-key-here
```

### 维基设置

通过管理后台自定义你的维基：
- 维基名称和简介
- Logo（表情符号或图片链接）
- 功能卡片
- 可用主题

## 可用主题

1. **Vocaloid 深色**（默认）- 紫粉渐变主题
2. **浅色** - 清爽白色主题
3. **复古** - 温暖的纸张风格
4. **赛博朋克** - 霓虹暗色主题
5. **森林** - 自然绿色主题
6. **海洋** - 深蓝色主题
7. **日落** - 温暖橙色渐变
8. **黑客** - 终端风格主题

## API 参考

### 文章接口

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| GET | `/api/articles` | 获取所有文章 |
| GET | `/api/articles/:id` | 根据 ID 获取文章 |
| POST | `/api/articles` | 创建新文章 |
| PUT | `/api/articles/:id` | 更新文章 |
| DELETE | `/api/articles/:id` | 删除文章 |
| GET | `/api/articles/search?q=` | 搜索文章 |

### 用户接口

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| POST | `/api/register` | 注册新用户 |
| POST | `/api/login` | 用户登录 |
| POST | `/api/logout` | 用户登出 |
| GET | `/api/user` | 获取当前用户信息 |

### 管理接口

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| GET | `/api/admin/users` | 获取所有用户列表 |
| PUT | `/api/admin/users/:id/role` | 更新用户角色 |
| DELETE | `/api/admin/users/:id` | 删除用户 |
| GET | `/api/admin/settings` | 获取站点设置 |
| PUT | `/api/admin/settings` | 更新站点设置 |

## 开发指南

### 开发模式运行

```bash
npm run dev
```

### 代码规范

项目使用原生 JavaScript，遵循一致的命名规范：
- 函数和变量使用驼峰命名
- 组件构造函数使用帕斯卡命名

## 自定义开发

### 添加新主题

编辑 `public/css/style.css`，添加新的 `[data-theme="主题名称"]` 选择器，定义你的颜色变量。

### 扩展 Markdown 解析器

位于 `public/lib/MDParser.js` 的自定义解析器可以扩展以支持更多 Markdown 语法。

### 集成不同数据库

修改 `src/database.js` 以连接你首选的数据库，同时保持相同的 API 接口。

## 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。

## 贡献指南

欢迎提交贡献！请随时提交 Pull Request。

## 致谢

- Express.js 团队提供 Web 框架
- 开源社区提供的各种工具库
