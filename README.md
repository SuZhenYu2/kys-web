# 武侠江湖 - Wuxia RPG Game

一个基于 Phaser.js 开发的武侠 RPG 游戏，参考金庸群侠传设计。

## 游戏特色

- 🎮 **经典武侠 RPG** - 探索江湖世界
- ⚔️ **回合制战斗系统** - 与敌人战斗
- 🏘️ **开放世界地图** - 自由探索
- 🗣️ **NPC 对话系统** - 与角色互动
- 📱 **响应式设计** - 支持多种屏幕

## 项目结构

```
/workspace/
├── src/
│   ├── main.js                    # 游戏入口
│   ├── scenes/                    # 游戏场景
│   │   ├── BootScene.js           # 启动场景
│   │   ├── PreloadScene.js        # 预加载场景
│   │   ├── MainMenuScene.js       # 主菜单
│   │   ├── GameScene.js           # 主游戏场景
│   │   ├── BattleScene.js         # 战斗场景
│   │   └── UIScene.js             # UI 界面
│   └── objects/                   # 游戏对象
│       ├── Player.js              # 玩家角色
│       ├── NPC.js                 # NPC 角色
│       └── Enemy.js               # 敌人
├── index.html                     # HTML 入口
├── package.json                   # 项目配置
└── vite.config.js                 # Vite 配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

游戏将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## 游戏操作

- **WASD** 或 **方向键** - 移动角色
- **空格键** - 与 NPC 对话/战斗
- **ESC 键** - 打开/关闭菜单
- **鼠标点击** - 与界面元素互动

## 已实现功能

✅ 主菜单和游戏说明
✅ 游戏世界地图（包含建筑、树木、山脉、河流）
✅ 玩家角色移动
✅ NPC 对话系统
✅ 敌人巡逻和战斗系统
✅ 回合制战斗界面
✅ 状态面板和小地图
✅ 游戏内菜单

## 开发中功能

🔄 武功/技能系统
🔄 物品背包系统
🔄 角色升级系统
🔄 更多地图区域
🔄 更多 NPC 和敌人
🔄 音效和背景音乐

## 技术栈

- **Phaser 3** - 游戏引擎
- **Vite** - 构建工具
- **JavaScript (ES6+)** - 编程语言

## License

MIT
