package com.kys.rpg.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kys.rpg.dto.GameMessage;
import com.kys.rpg.dto.PlayerInfo;
import com.kys.rpg.model.Player;
import com.kys.rpg.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketSessionHandler extends TextWebSocketHandler {

    private final WebSocketSessionManager sessionManager;
    private final WebSocketMessageHandler messageHandler;
    private final PlayerRepository playerRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            Player player = playerRepository.findByUsername(auth.getName()).orElse(null);
            if (player != null) {
                PlayerInfo playerInfo = PlayerInfo.builder()
                        .id(player.getId())
                        .username(player.getUsername())
                        .nickname(player.getNickname())
                        .level(player.getLevel())
                        .x(player.getPositionX())
                        .y(player.getPositionY())
                        .mapId(player.getMapId())
                        .build();

                sessionManager.addPlayer(player.getId(), playerInfo, session);

                sendPlayerJoinNotification(playerInfo);

                sendExistingPlayers(session, playerInfo.getMapId());
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            Player player = playerRepository.findByUsername(auth.getName()).orElse(null);
            if (player != null) {
                messageHandler.handleMessage(player.getId(), session, message.getPayload());
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            Player player = playerRepository.findByUsername(auth.getName()).orElse(null);
            if (player != null) {
                PlayerInfo playerInfo = sessionManager.getPlayerInfo(player.getId());
                sessionManager.removePlayer(player.getId());

                if (playerInfo != null) {
                    sendPlayerLeaveNotification(playerInfo);
                }
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket error: {}", exception.getMessage());
    }

    private void sendPlayerJoinNotification(PlayerInfo newPlayer) {
        GameMessage message = GameMessage.playerJoin(newPlayer);
        broadcastToMap(newPlayer.getMapId(), message, newPlayer.getId());
    }

    private void sendPlayerLeaveNotification(PlayerInfo leavingPlayer) {
        GameMessage message = GameMessage.playerLeave(leavingPlayer);
        broadcastToMap(leavingPlayer.getMapId(), message, null);
    }

    private void sendExistingPlayers(WebSocketSession session, String mapId) {
        Map<Long, PlayerInfo> existingPlayers = sessionManager.getPlayersInMap(mapId);
        existingPlayers.values().forEach(playerInfo -> {
            try {
                GameMessage message = GameMessage.playerJoin(playerInfo);
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            } catch (Exception e) {
                log.error("Error sending existing player: {}", e.getMessage());
            }
        });
    }

    public void broadcastToMap(String mapId, GameMessage message, Long excludePlayerId) {
        Map<Long, PlayerInfo> players = sessionManager.getPlayersInMap(mapId);
        players.entrySet().stream()
                .filter(e -> !e.getKey().equals(excludePlayerId))
                .forEach(entry -> {
                    WebSocketSession session = sessionManager.getSession(entry.getKey());
                    if (session != null && session.isOpen()) {
                        try {
                            String json = objectMapper.writeValueAsString(message);
                            session.sendMessage(new TextMessage(json));
                        } catch (Exception e) {
                            log.error("Error broadcasting message: {}", e.getMessage());
                        }
                    }
                });
    }

    public void sendMessage(Long playerId, GameMessage message) {
        WebSocketSession session = sessionManager.getSession(playerId);
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            } catch (Exception e) {
                log.error("Error sending message to player {}: {}", playerId, e.getMessage());
            }
        }
    }
}
