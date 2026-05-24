# 玩家服务层和地图系统开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成玩家服务层（Player Service）和地图系统（Map System）的开发，包括玩家位置管理、地图渲染和基本的游戏循环。

**Architecture:** 
- 后端：Spring Boot，使用WebSocket进行位置同步
- 前端：HTML5 Canvas进行地图渲染，键盘控制移动

**Tech Stack:**
- Java 21, Spring Boot 3.2.5, WebSocket, H2 Database
- HTML5 Canvas, Vanilla JavaScript

---

## 任务列表

### 任务1：玩家服务层（Player Service）
创建玩家相关的业务逻辑和数据访问层，包括玩家信息查询、位置更新等。

**要创建/修改的文件：**
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/service/PlayerService.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/controller/PlayerController.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/dto/PlayerProfileResponse.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/dto/PositionUpdateRequest.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/dto/PositionUpdateResponse.java`

---

### 任务2：WebSocket游戏消息处理
创建WebSocket消息处理器，处理玩家位置同步和聊天消息。

**要创建/修改的文件：**
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/dto/PositionBroadcast.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/websocket/GameWebSocketHandler.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/websocket/WebSocketSessionManager.java`
- 修改：`/workspace/backend/src/main/java/com/kys/rpg/config/WebSocketConfig.java`

---

### 任务3：地图系统基础（后端）
创建地图数据模型和地图服务。

**要创建/修改的文件：**
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/model/Map.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/model/MapTile.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/repository/MapRepository.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/service/MapService.java`
- 创建：`/workspace/backend/src/main/resources/db/migration/V3__Create_maps_and_tiles.sql`

---

### 任务4：游戏主控制器（后端）
创建游戏控制器，提供地图查询和游戏状态接口。

**要创建/修改的文件：**
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/controller/GameController.java`
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/dto/MapResponse.java`

---

### 任务5：前端地图渲染系统
在前端实现地图渲染、玩家移动和Canvas绘制。

**要创建/修改的文件：**
- 修改：`/workspace/frontend/js/main.js`（添加地图渲染和移动控制）
- 创建：`/workspace/frontend/js/game/Renderer.js`
- 创建：`/workspace/frontend/js/game/Map.js`
- 创建：`/workspace/frontend/js/game/Player.js`
- 创建：`/workspace/frontend/js/game/InputHandler.js`
- 修改：`/workspace/frontend/css/style.css`（添加游戏界面样式）

---

### 任务6：后端测试数据初始化
创建测试数据初始化器，在应用启动时预填充测试地图。

**要创建/修改的文件：**
- 创建：`/workspace/backend/src/main/java/com/kys/rpg/config/DataInitializer.java`

---

## 详细开发步骤

### 任务1：玩家服务层

**Step 1: 创建玩家个人信息响应DTO**
```java
package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfileResponse {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private Integer level;
    private Long experience;
    private Integer hp;
    private Integer hpMax;
    private Integer mp;
    private Integer mpMax;
    private Integer strength;
    private Integer constitution;
    private Integer agility;
    private Integer intelligence;
    private Integer luck;
    private String mapId;
    private Integer positionX;
    private Integer positionY;
    private Long silver;
    private Long gold;
    private Long reputation;
}
```

**Step 2: 创建位置更新请求DTO**
```java
package com.kys.rpg.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PositionUpdateRequest {
    @NotNull(message = "X坐标不能为空")
    private Integer x;
    
    @NotNull(message = "Y坐标不能为空")
    private Integer y;
    
    private String mapId;
}
```

**Step 3: 创建位置更新响应DTO**
```java
package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionUpdateResponse {
    private boolean success;
    private Integer x;
    private Integer y;
    private String mapId;
    private String message;
}
```

**Step 4: 创建PlayerService**
```java
package com.kys.rpg.service;

import com.kys.rpg.dto.PlayerProfileResponse;
import com.kys.rpg.dto.PositionUpdateRequest;
import com.kys.rpg.dto.PositionUpdateResponse;
import com.kys.rpg.model.Player;
import com.kys.rpg.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerService {
    
    private final PlayerRepository playerRepository;
    
    public PlayerProfileResponse getPlayerProfile(Principal principal) {
        String username = principal.getName();
        Player player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("玩家不存在"));
        
        return PlayerProfileResponse.builder()
                .id(player.getId())
                .username(player.getUsername())
                .nickname(player.getNickname())
                .email(player.getEmail())
                .level(player.getLevel())
                .experience(player.getExperience())
                .hp(player.getHp())
                .hpMax(player.getHpMax())
                .mp(player.getMp())
                .mpMax(player.getMpMax())
                .strength(player.getStrength())
                .constitution(player.getConstitution())
                .agility(player.getAgility())
                .intelligence(player.getIntelligence())
                .luck(player.getLuck())
                .mapId(player.getMapId())
                .positionX(player.getPositionX())
                .positionY(player.getPositionY())
                .silver(player.getSilver())
                .gold(player.getGold())
                .reputation(player.getReputation())
                .build();
    }
    
    @Transactional
    public PositionUpdateResponse updatePosition(Principal principal, PositionUpdateRequest request) {
        String username = principal.getName();
        Player player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("玩家不存在"));
        
        // 简单的位置验证
        if (request.getX() < 0 || request.getX() > 2000) {
            return PositionUpdateResponse.builder()
                    .success(false)
                    .message("X坐标超出范围")
                    .build();
        }
        
        if (request.getY() < 0 || request.getY() > 2000) {
            return PositionUpdateResponse.builder()
                    .success(false)
                    .message("Y坐标超出范围")
                    .build();
        }
        
        // 更新位置
        if (request.getMapId() != null) {
            player.setMapId(request.getMapId());
        }
        player.setPositionX(request.getX());
        player.setPositionY(request.getY());
        
        playerRepository.save(player);
        
        log.debug("玩家 {} 位置更新: ({}, {}) 在地图 {}", 
                username, request.getX(), request.getY(), player.getMapId());
        
        return PositionUpdateResponse.builder()
                .success(true)
                .x(player.getPositionX())
                .y(player.getPositionY())
                .mapId(player.getMapId())
                .message("位置更新成功")
                .build();
    }
    
    public Player getPlayerByUsername(String username) {
        return playerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("玩家不存在"));
    }
}
```

**Step 5: 创建PlayerController**
```java
package com.kys.rpg.controller;

import com.kys.rpg.dto.ApiResponse;
import com.kys.rpg.dto.PlayerProfileResponse;
import com.kys.rpg.dto.PositionUpdateRequest;
import com.kys.rpg.dto.PositionUpdateResponse;
import com.kys.rpg.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/player")
@RequiredArgsConstructor
public class PlayerController {
    
    private final PlayerService playerService;
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> getProfile(Principal principal) {
        PlayerProfileResponse profile = playerService.getPlayerProfile(principal);
        return ResponseEntity.ok(ApiResponse.success("获取玩家信息成功", profile));
    }
    
    @PutMapping("/position")
    public ResponseEntity<ApiResponse<PositionUpdateResponse>> updatePosition(
            Principal principal,
            @Valid @RequestBody PositionUpdateRequest request) {
        
        PositionUpdateResponse response = playerService.updatePosition(principal, request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(response.getMessage()));
        }
    }
}
```

---

### 任务2：WebSocket游戏消息处理

**Step 1: 创建位置广播DTO**
```java
package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionBroadcast {
    private Long playerId;
    private String nickname;
    private Integer x;
    private Integer y;
    private String mapId;
    private Long timestamp;
}
```

**Step 2: 创建WebSocket会话管理器**
```java
package com.kys.rpg.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionManager {
    
    private final Map<Long, WebSocketSession> playerSessions = new ConcurrentHashMap<>();
    
    public void addSession(Long playerId, WebSocketSession session) {
        playerSessions.put(playerId, session);
    }
    
    public void removeSession(Long playerId) {
        playerSessions.remove(playerId);
    }
    
    public WebSocketSession getSession(Long playerId) {
        return playerSessions.get(playerId);
    }
    
    public boolean isPlayerOnline(Long playerId) {
        return playerSessions.containsKey(playerId);
    }
}
```

**Step 3: 创建游戏WebSocket处理器**
```java
package com.kys.rpg.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kys.rpg.dto.PositionBroadcast;
import com.kys.rpg.model.Player;
import com.kys.rpg.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketHandler extends TextWebSocketHandler {
    
    private final PlayerRepository playerRepository;
    private final WebSocketSessionManager sessionManager;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 存储玩家位置和地图信息
    private final Map<String, Map<Long, PositionBroadcast>> mapPlayers = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 获取认证信息
        var auth = (UsernamePasswordAuthenticationToken) session.getPrincipal();
        if (auth != null && auth.getName() != null) {
            Player player = playerRepository.findByUsername(auth.getName())
                    .orElse(null);
            if (player != null) {
                sessionManager.addSession(player.getId(), session);
                log.info("玩家 {} 连接到游戏服务器", player.getNickname());
                
                // 初始化该玩家的位置
                PositionBroadcast position = PositionBroadcast.builder()
                        .playerId(player.getId())
                        .nickname(player.getNickname())
                        .x(player.getPositionX())
                        .y(player.getPositionY())
                        .mapId(player.getMapId())
                        .timestamp(System.currentTimeMillis())
                        .build();
                
                // 记录到地图玩家映射
                mapPlayers.computeIfAbsent(player.getMapId(), k -> new ConcurrentHashMap<>())
                        .put(player.getId(), position);
            }
        }
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        var auth = (UsernamePasswordAuthenticationToken) session.getPrincipal();
        if (auth == null) return;
        
        Player player = playerRepository.findByUsername(auth.getName())
                .orElse(null);
        if (player == null) return;
        
        try {
            // 处理位置更新
            PositionBroadcast receivedPosition = objectMapper.readValue(
                    message.getPayload(), PositionBroadcast.class);
            
            PositionBroadcast newPosition = PositionBroadcast.builder()
                    .playerId(player.getId())
                    .nickname(player.getNickname())
                    .x(receivedPosition.getX())
                    .y(receivedPosition.getY())
                    .mapId(player.getMapId())
                    .timestamp(System.currentTimeMillis())
                    .build();
            
            // 更新地图玩家位置
            mapPlayers.computeIfAbsent(player.getMapId(), k -> new ConcurrentHashMap<>())
                    .put(player.getId(), newPosition);
            
            // 更新数据库
            player.setPositionX(receivedPosition.getX());
            player.setPositionY(receivedPosition.getY());
            playerRepository.save(player);
            
            // 广播给同一地图的其他玩家
            broadcastPosition(player.getMapId(), newPosition);
            
        } catch (Exception e) {
            log.error("处理WebSocket消息失败: {}", e.getMessage());
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        var auth = (UsernamePasswordAuthenticationToken) session.getPrincipal();
        if (auth != null && auth.getName() != null) {
            Player player = playerRepository.findByUsername(auth.getName()).orElse(null);
            if (player != null) {
                sessionManager.removeSession(player.getId());
                log.info("玩家 {} 断开连接", player.getNickname());
                
                // 从地图玩家映射中移除
                Map<Long, PositionBroadcast> players = mapPlayers.get(player.getMapId());
                if (players != null) {
                    players.remove(player.getId());
                }
            }
        }
    }
    
    private void broadcastPosition(String mapId, PositionBroadcast position) throws Exception {
        Map<Long, PositionBroadcast> players = mapPlayers.get(mapId);
        if (players == null) return;
        
        String json = objectMapper.writeValueAsString(position);
        TextMessage message = new TextMessage(json);
        
        for (Long playerId : players.keySet()) {
            if (!playerId.equals(position.getPlayerId())) {
                WebSocketSession session = sessionManager.getSession(playerId);
                if (session != null && session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (Exception e) {
                        log.error("发送位置更新失败: {}", e.getMessage());
                    }
                }
            }
        }
    }
}
```

**Step 4: 更新WebSocket配置**
```java
package com.kys.rpg.config;

import com.kys.rpg.websocket.GameWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer, WebSocketMessageBrokerConfigurer {
    
    private final GameWebSocketHandler gameWebSocketHandler;
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(gameWebSocketHandler, "/ws/game")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

---

### 任务3：地图系统基础

**Step 1: 创建Map实体类**
```java
package com.kys.rpg.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "maps")
public class Map {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String mapId;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Integer width;
    
    @Column(nullable = false)
    private Integer height;
    
    @Column(name = "background_color", length = 20)
    private String backgroundColor;
    
    @OneToMany(mappedBy = "map", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<MapTile> tiles = new HashSet<>();
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Step 2: 创建MapTile实体类**
```java
package com.kys.rpg.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "map_tiles")
public class MapTile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private Map map;
    
    @Column(nullable = false)
    private Integer x;
    
    @Column(nullable = false)
    private Integer y;
    
    @Column(length = 20)
    private String type; // grass, water, wall, etc.
    
    @Column(name = "is_walkable")
    @Builder.Default
    private Boolean walkable = true;
    
    @Column(name = "is_solid")
    @Builder.Default
    private Boolean solid = false;
    
    @Column(name = "tile_color", length = 20)
    private String tileColor;
}
```

**Step 3: 创建MapRepository**
```java
package com.kys.rpg.repository;

import com.kys.rpg.model.Map;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MapRepository extends JpaRepository<Map, Long> {
    
    Optional<Map> findByMapId(String mapId);
    
    boolean existsByMapId(String mapId);
}
```

**Step 4: 创建MapService**
```java
package com.kys.rpg.service;

import com.kys.rpg.dto.MapResponse;
import com.kys.rpg.model.Map;
import com.kys.rpg.model.MapTile;
import com.kys.rpg.repository.MapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MapService {
    
    private final MapRepository mapRepository;
    
    public MapResponse getMapByMapId(String mapId) {
        Map map = mapRepository.findByMapId(mapId)
                .orElseThrow(() -> new RuntimeException("地图不存在: " + mapId));
        
        List<MapResponse.TileData> tiles = map.getTiles().stream()
                .sorted(Comparator.comparingInt(MapTile::getX)
                        .thenComparingInt(MapTile::getY))
                .map(tile -> MapResponse.TileData.builder()
                        .x(tile.getX())
                        .y(tile.getY())
                        .type(tile.getType())
                        .walkable(tile.getWalkable())
                        .solid(tile.getSolid())
                        .color(tile.getTileColor())
                        .build())
                .collect(Collectors.toList());
        
        return MapResponse.builder()
                .mapId(map.getMapId())
                .name(map.getName())
                .description(map.getDescription())
                .width(map.getWidth())
                .height(map.getHeight())
                .backgroundColor(map.getBackgroundColor())
                .tiles(tiles)
                .build();
    }
    
    public Map saveMap(Map map) {
        return mapRepository.save(map);
    }
}
```

**Step 5: 创建数据库迁移脚本**
```sql
CREATE TABLE maps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    map_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    width INT NOT NULL,
    height INT NOT NULL,
    background_color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE map_tiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    map_id VARCHAR(50) NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL,
    type VARCHAR(20),
    is_walkable BOOLEAN DEFAULT TRUE,
    is_solid BOOLEAN DEFAULT FALSE,
    tile_color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (map_id) REFERENCES maps(map_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tile_position (map_id, x, y)
);
```

---

### 任务4：游戏主控制器

**Step 1: 创建MapResponse DTO**
```java
package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapResponse {
    
    private String mapId;
    private String name;
    private String description;
    private Integer width;
    private Integer height;
    private String backgroundColor;
    private List<TileData> tiles;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TileData {
        private Integer x;
        private Integer y;
        private String type;
        private Boolean walkable;
        private Boolean solid;
        private String color;
    }
}
```

**Step 2: 创建GameController**
```java
package com.kys.rpg.controller;

import com.kys.rpg.dto.ApiResponse;
import com.kys.rpg.dto.MapResponse;
import com.kys.rpg.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {
    
    private final MapService mapService;
    
    @GetMapping("/map/{mapId}")
    public ResponseEntity<ApiResponse<MapResponse>> getMap(@PathVariable String mapId) {
        MapResponse map = mapService.getMapByMapId(mapId);
        return ResponseEntity.ok(ApiResponse.success("获取地图成功", map));
    }
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("游戏服务运行正常", "OK"));
    }
}
```

---

### 任务5：前端地图渲染系统

**Step 1: 创建InputHandler.js**
```javascript
class InputHandler {
    constructor(gameClient) {
        this.gameClient = gameClient;
        this.keys = {};
        this.setupListeners();
    }
    
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key];
    }
    
    getMovement() {
        let dx = 0, dy = 0;
        
        if (this.isKeyPressed('w') || this.isKeyPressed('W') || this.isKeyPressed('ArrowUp')) {
            dy = -1;
        }
        if (this.isKeyPressed('s') || this.isKeyPressed('S') || this.isKeyPressed('ArrowDown')) {
            dy = 1;
        }
        if (this.isKeyPressed('a') || this.isKeyPressed('A') || this.isKeyPressed('ArrowLeft')) {
            dx = -1;
        }
        if (this.isKeyPressed('d') || this.isKeyPressed('D') || this.isKeyPressed('ArrowRight')) {
            dx = 1;
        }
        
        return { dx, dy };
    }
}
```

**Step 2: 创建Map.js**
```javascript
class GameMap {
    constructor() {
        this.mapId = 'xiangyang';
        this.name = '襄阳城';
        this.width = 100;
        this.height = 100;
        this.tileSize = 32;
        this.tiles = [];
        this.backgroundColor = '#2d4a3e';
    }
    
    loadMapData(mapData) {
        this.mapId = mapData.mapId;
        this.name = mapData.name;
        this.description = mapData.description;
        this.width = mapData.width;
        this.height = mapData.height;
        this.tiles = mapData.tiles;
        if (mapData.backgroundColor) {
            this.backgroundColor = mapData.backgroundColor;
        }
    }
    
    getTile(x, y) {
        return this.tiles.find(t => t.x === x && t.y === y);
    }
    
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile ? tile.walkable : true;
    }
}
```

**Step 3: 创建Player.js（前端）**
```javascript
class Player {
    constructor(x, y, nickname) {
        this.x = x;
        this.y = y;
        this.nickname = nickname;
        this.color = '#ff6b6b';
        this.speed = 0.15;
        this.targetX = x;
        this.targetY = y;
    }
    
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    update(deltaTime) {
        // 平滑移动
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.1) {
            const moveX = (dx / dist) * this.speed * deltaTime;
            const moveY = (dy / dist) * this.speed * deltaTime;
            
            this.x += moveX;
            this.y += moveY;
            
            if (Math.abs(this.x - this.targetX) < 0.1) {
                this.x = this.targetX;
            }
            if (Math.abs(this.y - this.targetY) < 0.1) {
                this.y = this.targetY;
            }
        }
    }
    
    draw(ctx, cameraX, cameraY, tileSize) {
        const screenX = (this.x - cameraX) * tileSize;
        const screenY = (this.y - cameraY) * tileSize;
        
        // 绘制玩家
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX + tileSize/2, screenY + tileSize/2, tileSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制昵称
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(this.nickname, screenX + tileSize/2, screenY - 5);
    }
}
```

**Step 4: 创建Renderer.js**
```javascript
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.cameraY = 0;
        this.tileSize = 32;
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    clear() {
        this.ctx.fillStyle = '#2d4a3e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setCamera(playerX, playerY, mapWidth, mapHeight) {
        // 相机跟随玩家
        this.cameraX = playerX - (this.canvas.width / this.tileSize) / 2;
        this.cameraY = playerY - (this.canvas.height / this.tileSize) / 2;
        
        // 边界检查
        this.cameraX = Math.max(0, Math.min(this.cameraX, mapWidth - this.canvas.width / this.tileSize));
        this.cameraY = Math.max(0, Math.min(this.cameraY, mapHeight - this.canvas.height / this.tileSize));
    }
    
    drawMap(map) {
        this.ctx.fillStyle = map.backgroundColor || '#2d4a3e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const startTileX = Math.floor(this.cameraX);
        const startTileY = Math.floor(this.cameraY);
        const endTileX = startTileX + Math.ceil(this.canvas.width / this.tileSize) + 1;
        const endTileY = startTileY + Math.ceil(this.canvas.height / this.tileSize) + 1;
        
        for (let x = startTileX; x < endTileX; x++) {
            for (let y = startTileY; y < endTileY; y++) {
                const tile = map.getTile(x, y);
                this.drawTile(x, y, tile);
            }
        }
    }
    
    drawTile(x, y, tile) {
        const screenX = (x - this.cameraX) * this.tileSize;
        const screenY = (y - this.cameraY) * this.tileSize;
        
        if (tile && tile.color) {
            this.ctx.fillStyle = tile.color;
        } else {
            this.ctx.fillStyle = '#3d5a4e';
        }
        
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // 绘制网格线
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
    }
    
    drawPlayer(player) {
        player.draw(this.ctx, this.cameraX, this.cameraY, this.tileSize);
    }
    
    drawOtherPlayers(players) {
        players.forEach(player => {
            player.draw(this.ctx, this.cameraX, this.cameraY, this.tileSize);
        });
    }
}
```

**Step 5: 更新main.js，集成所有组件**
```javascript
class GameClient {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentPlayer = null;
        this.otherPlayers = new Map();
        this.gameMap = new GameMap();
        this.renderer = null;
        this.inputHandler = null;
        this.gameSocket = null;
        this.lastUpdateTime = 0;
        this.positionUpdateInterval = 100;
        this.lastPositionUpdate = 0;
        this.gameLoop = null;
    }
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.renderer = new Renderer(this.canvas);
            this.inputHandler = new InputHandler(this);
            this.renderer.resize(1024, 768);
        }
        
        this.setupEventListeners();
        this.checkAuth();
    }
    
    checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            const username = localStorage.getItem('username');
            const nickname = localStorage.getItem('nickname');
            const playerId = localStorage.getItem('playerId');
            
            if (username && nickname) {
                this.currentPlayer = {
                    id: playerId,
                    username: username,
                    nickname: nickname,
                    level: 1,
                    hp: 1000,
                    hpMax: 1000,
                    mp: 500,
                    mpMax: 500,
                    x: 1000,
                    y: 1000
                };
                this.showGameUI();
                this.loadMap();
                this.startGameLoop();
            }
        }
    }
    
    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showRegisterPanel();
            });
        }
        
        const regCancel = document.getElementById('reg-cancel');
        if (regCancel) {
            regCancel.addEventListener('click', () => {
                this.showLoginPanel();
            });
        }
        
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        const chatSend = document.getElementById('chat-send');
        if (chatSend) {
            chatSend.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
        
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }
    
    async loadMap() {
        try {
            // 加载襄阳城地图
            const response = await API.game.getMap('xiangyang');
            if (response.success && response.data) {
                this.gameMap.loadMapData(response.data);
            }
        } catch (error) {
            console.error('加载地图失败:', error);
            // 使用默认地图数据
            this.createDefaultMap();
        }
    }
    
    createDefaultMap() {
        this.gameMap = new GameMap();
        // 创建简单的网格地图
        for (let x = 0; x < 100; x++) {
            for (let y = 0; y < 100; y++) {
                this.gameMap.tiles.push({
                    x: x,
                    y: y,
                    type: 'grass',
                    walkable: true,
                    solid: false,
                    color: (x + y) % 2 === 0 ? '#3d5a4e' : '#4d6a5e'
                });
            }
        }
    }
    
    startGameLoop() {
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // 处理输入
        if (this.inputHandler && this.currentPlayer) {
            const movement = this.inputHandler.getMovement();
            if (movement.dx !== 0 || movement.dy !== 0) {
                const newX = this.currentPlayer.x + movement.dx;
                const newY = this.currentPlayer.y + movement.dy;
                
                // 检查是否可行走
                if (this.gameMap.isWalkable(Math.floor(newX), Math.floor(newY))) {
                    this.currentPlayer.x = Math.max(0, Math.min(newX, this.gameMap.width - 1));
                    this.currentPlayer.y = Math.max(0, Math.min(newY, this.gameMap.height - 1));
                    
                    // 发送位置更新
                    if (now - this.lastPositionUpdate > this.positionUpdateInterval) {
                        this.sendPositionUpdate();
                        this.lastPositionUpdate = now;
                    }
                }
            }
        }
        
        // 渲染
        this.render();
        
        // 继续游戏循环
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    render() {
        if (!this.renderer || !this.currentPlayer) return;
        
        this.renderer.clear();
        this.renderer.setCamera(
            this.currentPlayer.x, 
            this.currentPlayer.y, 
            this.gameMap.width, 
            this.gameMap.height
        );
        
        // 绘制地图
        this.renderer.drawMap(this.gameMap);
        
        // 绘制玩家
        const player = new Player(
            this.currentPlayer.x, 
            this.currentPlayer.y, 
            this.currentPlayer.nickname
        );
        this.renderer.drawPlayer(player);
        
        // 绘制其他玩家
        const otherPlayerList = Array.from(this.otherPlayers.values());
        this.renderer.drawOtherPlayers(otherPlayerList);
        
        // 更新玩家信息显示
        this.updatePlayerInfoUI();
    }
    
    sendPositionUpdate() {
        if (!this.gameSocket) return;
        
        try {
            const position = {
                x: this.currentPlayer.x,
                y: this.currentPlayer.y,
                timestamp: Date.now()
            };
            
            // 通过HTTP API更新位置
            API.player.updatePosition({
                x: Math.floor(this.currentPlayer.x),
                y: Math.floor(this.currentPlayer.y)
            });
            
        } catch (error) {
            console.error('发送位置更新失败:', error);
        }
    }
    
    updatePlayerInfoUI() {
        const infoElement = document.getElementById('player-info');
        if (infoElement && this.currentPlayer) {
            infoElement.innerHTML = `
                <div class="hp-bar">
                    <span class="label">HP</span>
                    <div class="bar-fill hp" style="width: ${(this.currentPlayer.hp/this.currentPlayer.hpMax)*100}%"></div>
                </div>
                <div class="mp-bar">
                    <span class="label">MP</span>
                    <div class="bar-fill mp" style="width: ${(this.currentPlayer.mp/this.currentPlayer.mpMax)*100}%"></div>
                </div>
                <div class="info-text">
                    ${this.currentPlayer.nickname} Lv.${this.currentPlayer.level}
                </div>
            `;
        }
    }
    
    showGameUI() {
        document.getElementById('login-panel').classList.add('hidden');
        document.getElementById('register-panel').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        this.addChatMessage('系统', '欢迎来到江湖，' + this.currentPlayer.nickname + '！', 'system');
    }
    
    showRegisterPanel() {
        document.getElementById('login-panel').classList.add('hidden');
        document.getElementById('register-panel').classList.remove('hidden');
    }
    
    showLoginPanel() {
        document.getElementById('register-panel').classList.add('hidden');
        document.getElementById('login-panel').classList.remove('hidden');
    }
    
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        
        if (!username || !password) {
            errorElement.textContent = '请填写用户名和密码';
            errorElement.classList.remove('hidden');
            return;
        }
        
        errorElement.classList.add('hidden');
        
        try {
            const response = await API.auth.login(username, password);
            
            if (response.success && response.data) {
                const data = response.data;
                localStorage.setItem('token', data.token);
                localStorage.setItem('playerId', data.player.id);
                localStorage.setItem('username', data.player.username);
                localStorage.setItem('nickname', data.player.nickname);
                
                this.currentPlayer = {
                    id: data.player.id,
                    username: data.player.username,
                    nickname: data.player.nickname,
                    level: data.player.level,
                    hp: 1000,
                    hpMax: 1000,
                    mp: 500,
                    mpMax: 500,
                    x: 1000,
                    y: 1000
                };
                
                this.showGameUI();
                this.loadMap();
                this.startGameLoop();
            }
        } catch (error) {
            errorElement.textContent = error.message || '登录失败';
            errorElement.classList.remove('hidden');
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const nickname = document.getElementById('reg-nickname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const errorElement = document.getElementById('register-error');
        
        if (!username || !password || !nickname) {
            errorElement.textContent = '请填写必填项';
            errorElement.classList.remove('hidden');
            return;
        }
        
        errorElement.classList.add('hidden');
        
        try {
            const response = await API.auth.register(username, password, nickname, email);
            
            if (response.success) {
                alert('注册成功！请登录');
                this.showLoginPanel();
                document.getElementById('username').value = username;
            } else {
                errorElement.textContent = response.message || '注册失败';
                errorElement.classList.remove('hidden');
            }
        } catch (error) {
            errorElement.textContent = error.message || '注册失败';
            errorElement.classList.remove('hidden');
        }
    }
    
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('playerId');
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        
        this.currentPlayer = null;
        this.otherPlayers.clear();
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('login-panel').classList.remove('hidden');
    }
    
    addChatMessage(sender, message, type) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type || ''}`;
        messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (message) {
            this.addChatMessage('你', message);
            // TODO: 发送到服务器
            input.value = '';
        }
    }
}

// API封装（补充）
const API = {
    baseUrl: 'http://localhost:8080/api',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },
    
    auth: {
        async login(username, password) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },
        
        async register(username, password, nickname, email) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password, nickname, email })
            });
        },
        
        async health() {
            return API.request('/auth/health');
        }
    },
    
    player: {
        async getProfile() {
            return API.request('/player/profile');
        },
        
        async updatePosition(data) {
            return API.request('/player/position', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        }
    },
    
    game: {
        async getMap(mapId) {
            return API.request(`/game/map/${mapId}`);
        },
        
        async health() {
            return API.request('/game/health');
        }
    }
};

// 初始化游戏
const gameClient = new GameClient();
document.addEventListener('DOMContentLoaded', () => {
    gameClient.init();
});
```

**Step 6: 更新CSS样式**
```css
/* 添加游戏界面样式 */
#game-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

#game-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
}

#game-header .header-title {
    color: #daa520;
    font-size: 20px;
    font-weight: bold;
}

#logout-btn {
    padding: 8px 20px;
    background: #8b4513;
    border: 1px solid #daa520;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

#logout-btn:hover {
    background: #daa520;
    color: #000;
}

#player-info {
    position: absolute;
    top: 70px;
    left: 20px;
    z-index: 10;
}

#player-info .hp-bar,
#player-info .mp-bar {
    background: rgba(0,0,0,0.7);
    border: 1px solid #666;
    border-radius: 4px;
    padding: 4px 10px;
    margin: 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    min-width: 200px;
}

#player-info .label {
    color: white;
    font-weight: bold;
    z-index: 1;
    font-size: 12px;
}

#player-info .bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 3px;
    z-index: 0;
}

#player-info .bar-fill.hp {
    background: linear-gradient(90deg, #8b0000 0%, #ff4444 100%);
}

#player-info .bar-fill.mp {
    background: linear-gradient(90deg, #00008b 0%, #4444ff 100%);
}

#player-info .info-text {
    color: #daa520;
    margin-top: 8px;
    font-size: 14px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

#chat-panel {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 400px;
    max-height: 250px;
    background: rgba(0,0,0,0.7);
    border: 1px solid #8b4513;
    border-radius: 8px;
    padding: 10px;
    z-index: 10;
}

#chat-messages {
    height: 180px;
    overflow-y: auto;
    margin-bottom: 10px;
    color: white;
    font-size: 13px;
}

#chat-messages .message {
    margin: 4px 0;
    line-height: 1.4;
}

#chat-messages .system {
    color: #87ceeb;
}

#chat-messages strong {
    color: #daa520;
}

#chat-input-container {
    display: flex;
    gap: 10px;
}

#chat-input {
    flex: 1;
    padding: 8px;
    background: #222;
    border: 1px solid #555;
    border-radius: 4px;
    color: white;
}

#chat-send {
    padding: 8px 16px;
    background: #8b4513;
    color: white;
    border: 1px solid #daa520;
    border-radius: 4px;
    cursor: pointer;
}

#chat-send:hover {
    background: #daa520;
    color: #000;
}

#game-canvas {
    display: block;
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #888;
}
```

---

### 任务6：测试数据初始化器

**Step 1: 创建数据初始化器**
```java
package com.kys.rpg.config;

import com.kys.rpg.model.Map;
import com.kys.rpg.model.MapTile;
import com.kys.rpg.repository.MapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final MapRepository mapRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (!mapRepository.existsByMapId("xiangyang")) {
            createXiangyangMap();
            log.info("襄阳城地图初始化完成");
        }
    }
    
    private void createXiangyangMap() {
        Map map = Map.builder()
                .mapId("xiangyang")
                .name("襄阳城")
                .description("南宋边防重镇，郭靖、黄蓉驻守之地")
                .width(100)
                .height(100)
                .backgroundColor("#2d4a3e")
                .build();
        
        Set<MapTile> tiles = new HashSet<>();
        
        // 创建简单的网格地图
        for (int x = 0; x < 100; x++) {
            for (int y = 0; y < 100; y++) {
                String color = (x + y) % 2 == 0 ? "#3d5a4e" : "#4d6a5e";
                boolean walkable = true;
                
                // 创建一些墙壁
                if (x == 0 || x == 99 || y == 0 || y == 99) {
                    color = "#5a4a3e";
                    walkable = false;
                }
                
                // 中心区域 - 广场
                if (x >= 40 && x <= 60 && y >= 40 && y <= 60) {
                    color = "#7a6a5e";
                }
                
                tiles.add(MapTile.builder()
                        .map(map)
                        .x(x)
                        .y(y)
                        .type("grass")
                        .walkable(walkable)
                        .solid(!walkable)
                        .tileColor(color)
                        .build());
            }
        }
        
        map.setTiles(tiles);
        mapRepository.save(map);
    }
}
```

---

## 实施说明

1. **后端先于前端开发**，确保API接口可用
2. **先创建测试数据**，让我们有内容可以显示
3. **分步测试**，每个模块独立开发和测试
4. **使用H2数据库**，方便本地开发测试
5. **前端UI先完成**，让我们可以直观地看到效果

计划完全详细，包含所有必要的代码，可以直接执行开发！
