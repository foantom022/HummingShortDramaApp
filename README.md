# 短剧APP - 小米AI编程大赛作品

一个基于Next.js 14开发的沉浸式短剧播放Web应用，支持全屏播放、滑动切换、智能搜索等功能。

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4 + shadcn/ui
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **视频**: Video.js
- **状态管理**: Zustand + SWR
- **部署**: Vercel

## 📁 项目结构

```
short-drama-app/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   └── (pages)/           # 页面组件
├── components/            # React组件
│   ├── ui/               # shadcn/ui基础组件
│   ├── video/            # 视频播放器组件
│   ├── drama/            # 剧集相关组件
│   └── search/           # 搜索组件
├── lib/                   # 工具库
│   ├── prisma.ts         # Prisma客户端
│   ├── video-service.ts  # 视频签名服务
│   └── utils.ts          # 工具函数
├── hooks/                 # 自定义Hooks
├── store/                 # Zustand状态管理
├── types/                 # TypeScript类型定义
├── prisma/               # 数据库Schema
├── scripts/              # 脚本文件
└── code-gen-record/      # AI编程记录
```

## 🛠️ 本地开发

### 环境要求

- Node.js 18+
- PostgreSQL 15+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd short-drama-app
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置数据库连接和CDN密钥：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/shortdrama"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
CDN_KEY="your-cdn-key"
```

4. **初始化数据库**
```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库Schema
npm run db:push
```

5. **导入数据**
```bash
# 确保data.json在项目根目录的上一级
npm run import:data
```

6. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 📦 构建部署

### 本地构建

```bash
npm run build
npm start
```

### Vercel部署

1. 推送代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量
4. 自动部署

### Docker部署

```bash
docker build -t short-drama-app .
docker run -p 3000:3000 short-drama-app
```

## 🎯 核心功能

### ✅ 后端已完成（100%）

- [x] 项目基础架构
- [x] 数据库Schema设计（15个表）
- [x] 视频URL签名算法
- [x] 数据导入（1,024部剧集）
- [x] 用户认证系统（注册、登录、JWT）
- [x] 剧集管理API（列表、详情、筛选、排序）
- [x] 搜索功能（实时搜索、联想）
- [x] 互动功能（点赞、评论、收藏）
- [x] 个人中心（观看历史、收藏列表）
- [x] VIP系统（307部VIP剧集）
- [x] 信息流API（类抖音模式）
- [x] AI Chatbot（角色扮演）
- [x] 用户行为追踪
- [x] 管理员后台API

**API接口总数：28个**

### 🚧 前端开发中

- [ ] 主页（搜索栏、推荐、分类列表）
- [ ] 信息流页（全屏视频、滑动切换）
- [ ] AI Chatbot页（角色对话）
- [ ] VIP专属区
- [ ] 个人中心页
- [ ] 视频播放器组件

## 📊 数据库命令

```bash
# 生成Prisma客户端
npm run db:generate

# 推送Schema到数据库
npm run db:push

# 创建迁移
npm run db:migrate

# 打开Prisma Studio
npm run db:studio
```

## 🤖 AI编程记录

本项目大量使用AI辅助开发，详细记录见 `code-gen-record/` 目录。

## 📝 开发规范

- 使用TypeScript严格模式
- 遵循ESLint规则
- 组件使用函数式编程
- API路由使用RESTful规范

## 🔗 相关链接

- [Next.js文档](https://nextjs.org/docs)
- [Prisma文档](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Video.js](https://videojs.com)

## 📄 License

MIT

## 👥 团队

小米AI编程大赛参赛作品
