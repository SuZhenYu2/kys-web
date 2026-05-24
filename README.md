# 金庸群侠传·江湖行

一个基于金庸武侠小说的多人在线 RPG 游戏，使用 DeepSeek 大模型驱动智能 NPC。

## 技术栈

**后端:**
- Java 21
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- Spring WebSocket
- H2 Database (开发环境)
- MySQL 8 (生产环境)
- Redis 7

**前端:**
- HTML5
- Canvas 2D
- 原生 JavaScript (ES6+)
- SockJS + STOMP

**AI:**
- DeepSeek API

## 项目结构

```
kys-rpg/
├── backend/                    # Spring Boot 后端
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kys/rpg/
│   │   │   │   ├── config/     # 配置
│   │   │   │   ├── controller/ # REST 控制器
│   │   │   │   ├── dto/        # 数据传输对象
│   │   │   │   ├── model/      # JPA 实体
│   │   │   │   ├── repository/ # 数据仓库
│   │   │   │   ├── security/   # 安全相关
│   │   │   │   ├── service/    # 业务逻辑
│   │   │   │   └── websocket/  # WebSocket 处理
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/
│   └── pom.xml
├── frontend/                   # HTML5 Canvas 前端
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── game/              # 游戏核心逻辑
│       ├── api.js             # API 封装
│       └── main.js            # 入口
└── docs/
    └── superpowers/
        ├── specs/             # 设计文档
        └── plans/             # 开发计划
```

## 快速开始

### 前端运行

直接在浏览器中打开:
```
frontend/index.html
```

使用任何 HTTP 服务器，例如 Python：
```bash
cd frontend
python3 -m http.server 8080
```

然后在浏览器访问：`http://localhost:8080`

### 后端运行

```bash
cd backend
mvn spring-boot:run
```

后端服务运行在：`http://localhost:8080`

## 功能特性

- ✅ 玩家注册/登录 (JWT 认证)
- ✅ 游戏地图渲染与探索
- ✅ 玩家角色移动 (WASD/方向键)
- ⏳ WebSocket 实时位置同步
- ⏳ AI NPC 对话系统 (DeepSeek)
- ⏳ 战斗系统
- ⏳ 装备系统
- ⏳ 门派系统

## 游戏设计

详细的游戏设计文档见：`docs/superpowers/specs/2026-05-24-kys-rpg-design.md`

## 开发计划

- ✅ 基础设施与项目初始化
- ✅ 玩家认证系统
- ✅ 地图系统与玩家移动
- ⏳ 玩家位置同步
- ⏳ AI NPC 系统
- ⏳ 战斗系统
- ⏳ 装备系统
- ⏳ 任务系统

## 许可证

MIT
