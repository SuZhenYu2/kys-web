package com.kys.rpg.websocket;

import com.kys.rpg.dto.PlayerInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class WebSocketSessionManager {
    private final Map<Long, WebSocketSession> playerSessions = new ConcurrentHashMap<>();
    private final Map<Long, PlayerInfo> playerInfoMap = new ConcurrentHashMap<>();
    private final Map<String, Map<Long, PlayerInfo>> mapPlayers = new ConcurrentHashMap<>();

    public void addPlayer(Long playerId, PlayerInfo playerInfo, WebSocketSession session) {
        playerSessions.put(playerId, session);
        playerInfoMap.put(playerId, playerInfo);

        mapPlayers.computeIfAbsent(playerInfo.getMapId(), k -> new ConcurrentHashMap<>())
                .put(playerId, playerInfo);

        log.info("Player {} joined map {}", playerId, playerInfo.getMapId());
    }

    public void removePlayer(Long playerId) {
        PlayerInfo playerInfo = playerInfoMap.get(playerId);
        if (playerInfo != null) {
            Map<Long, PlayerInfo> map = mapPlayers.get(playerInfo.getMapId());
            if (map != null) {
                map.remove(playerId);
                if (map.isEmpty()) {
                    mapPlayers.remove(playerInfo.getMapId());
                }
            }
        }

        playerSessions.remove(playerId);
        playerInfoMap.remove(playerId);
        log.info("Player {} left", playerId);
    }

    public WebSocketSession getSession(Long playerId) {
        return playerSessions.get(playerId);
    }

    public PlayerInfo getPlayerInfo(Long playerId) {
        return playerInfoMap.get(playerId);
    }

    public Map<Long, PlayerInfo> getPlayersInMap(String mapId) {
        return mapPlayers.getOrDefault(mapId, Map.of());
    }

    public boolean isPlayerOnline(Long playerId) {
        return playerSessions.containsKey(playerId);
    }

    public int getPlayerCount() {
        return playerSessions.size();
    }
}
