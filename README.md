# OPS Admin - 运维管理后台系统

一个现代化的企业级运维管理后台系统，提供服务器监控、告警管理、任务调度等功能。

## 🛠 技术栈

### Frontend
- **框架**: React 18 + Next.js 14
- **UI 组件库**: HeroUI
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **图表**: Recharts
- **图标**: Lucide React

### Backend
- **框架**: Django 4.2 + Django REST Framework
- **认证**: JWT (PyJWT)
- **数据库**: MySQL 8.0
- **服务器**: Gunicorn

### Infrastructure
- **容器化**: Docker + Docker Compose
- **数据持久化**: Docker Volumes

## 🚀 启动指南 (How to Run)

1. 确保 Docker Desktop 已启动
2. 在根目录执行：
   ```bash
   docker compose up --build
   ```
3. 等待容器启动完成（首次构建约需 3-5 分钟）

## 🔗 服务地址 (Services)

| 服务 | 地址 |
|------|------|
| 前端应用 | http://localhost:3000 |
| 后端 API | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin |
| MySQL | localhost:3306 |

## 🧪 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

## ✨ 核心功能

### 1. 用户认证
- JWT Token 认证
- 登录/登出功能
- 会话持久化

### 2. 仪表盘
- 服务器状态概览
- 资源使用率统计（CPU/内存/磁盘）
- 实时图表展示
- 告警和任务快览

## 📁 项目结构

```
taskId1016/
├── docker-compose.yml      # Docker 编排配置
├── README.md               # 项目说明文档
├── .gitignore              # Git 忽略配置
├── .dockerignore           # Docker 忽略配置
├── database/
│   └── init.sql            # 数据库初始化脚本
├── backend/                # Django 后端
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── entrypoint.sh
│   ├── ops_admin/          # Django 项目配置
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── api/                # API 应用
│       ├── models.py       # 数据模型
│       ├── views.py        # 视图
│       ├── serializers.py  # 序列化器
│       ├── urls.py         # 路由
│       └── authentication.py # JWT 认证
└── frontend/               # Next.js 前端
    ├── Dockerfile
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── src/
        ├── app/            # Next.js App Router
        │   ├── login/      # 登录页面
        │   └── dashboard/  # 仪表盘页面
        ├── components/     # React 组件
        ├── lib/            # 工具库
        ├── store/          # 状态管理
        └── types/          # TypeScript 类型
```

## 🗄️ 数据库设计

### Users (用户表)
- Django 内置用户模型

### Servers (服务器表)
- 服务器基本信息
- 状态和资源使用率

### Alerts (告警表)
- 告警信息
- 级别和状态

### Tasks (任务表)
- 任务信息
- 优先级和分配

### OperationLogs (操作日志表)
- 系统操作记录

## 🔧 开发说明

### 本地开发（非 Docker）

**后端**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

**前端**:
```bash
cd frontend
npm install
npm run dev
```

### 环境变量

后端环境变量（docker-compose.yml 中配置）:
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户
- `DB_PASSWORD`: 数据库密码
- `SECRET_KEY`: Django 密钥

前端环境变量:
- `NEXT_PUBLIC_API_URL`: 后端 API 地址

## 🐳 Docker 配置说明

- **MySQL**: 持久化存储，数据保存在 `mysql_data` 卷，UTF8MB4 编码
- **Backend**: Django + Gunicorn，端口 8000
- **Frontend**: Next.js Standalone，端口 3000

## 🎨 UI 特性

- 响应式布局，适配桌面和移动端
- 现代化渐变背景和卡片设计
- 流畅的动画过渡效果
- 完善的加载状态和错误提示
- Toast 消息通知

## 📄 License

MIT License
