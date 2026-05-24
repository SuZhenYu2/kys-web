# WebSocket 实时位置同步开发计划

> **目标:** 实现玩家位置的实时同步，包括玩家进入/离开通知，以及其他玩家在地图上的显示。

## 实现步骤

### 1. 创建位置广播 DTO
- 创建通用的 WebSocket 消息格式
- 玩家位置更新消息
- 玩家加入/离开消息
- 聊天消息

### 2. 后端 WebSocket 消息处理器
- WebSocketSessionManager - 管理在线玩家
- WebSocket 消息处理
- 玩家进入地图
- 玩家移动广播
- 玩家离开通知

### 3. 前端 WebSocket 客户端
- 连接管理
- 消息处理
- 位置发送
- 错误重试

### 4. 其他玩家显示
- 玩家地图上显示其他玩家
- 平滑移动动画
- 玩家信息更新

## 文件结构

### 新增/修改文件
- 后端新增
```
backend/src/main/java/com/kys/rpg/
├── dto/
│   ├── GameMessage.java
│   ├── GameMessageType.java
│   ├── PlayerJoinMessage.java
│   ├── PlayerLeaveMessage.java
│   ├── PlayerMoveMessage.java
│   └── PlayerInfo.java
├── websocket/
│   ├── WebSocketSessionManager.java
│   ├── WebSocketSessionHandler.java
│   └── WebSocketMessageHandler.java
├── config/
│   └── WebSocketConfig.java (更新)
└── service/
    └── GameService.java
```

- 前端新增
```
frontend/js/game/
├── WebSocketClient.js
└── OtherPlayer.js
```

## 实现计划

### 任务 1: 后端 DTO 和消息类型
创建 WebSocket 消息 DTO 类

### 任务 2: WebSocket 会话管理
创建会话管理器和消息处理器

### 任务 3: 更新 WebSocket 配置
配置 WebSocket 端点和消息代理

### 任务 4: 前端 WebSocket 客户端
创建前端 WebSocket 集成

### 任务 5: 前端其他玩家显示
更新前端地图渲染，显示其他玩家

### 任务 6: 前后端集成和测试
完整测试端对端测试
