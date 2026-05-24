package com.kys.rpg.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kys.rpg.dto.GameMessage;
import com.kys.rpg.dto.PlayerInfo;
import com.kys.rpg.model.Player;
import com.kys.rpg.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageHandler {

    private final WebSocketSessionHandler sessionHandler;
    private final WebSocketSessionManager sessionManager;
    private final PlayerRepository playerRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void handleMessage(Long playerId, org.springframework.web.socket.WebSocketSession session, String payload) {
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String type = jsonNode.has("type") ? jsonNode.get("type").asText() : null;

            if ("move".equals(type)) {
                handlePlayerMove(playerId, jsonNode);
            } else if ("chat".equals(type)) {
                handleChatMessage(playerId, jsonNode);
            }
        } catch (Exception e) {
            log.error("Error handling WebSocket message: {}", e.getMessage());
        }
    }

    private void handlePlayerMove(Long playerId, JsonNode payload) {
        try {
            Integer x = payload.has("x") ? payload.get("x").asInt() : null;
            Integer y = payload.has("y") ? payload.get("y").asInt() : null;

            if (x == null || y == null) return;

            Player player = playerRepository.findById(playerId).orElse(null);
            if (player == null) return;

            player.setPositionX(x);
            player.setPositionY(y);
            playerRepository.save(player);

            PlayerInfo playerInfo = sessionManager.getPlayerInfo(playerId);
            if (playerInfo != null) {
                playerInfo.setX(x);
                playerInfo.setY(y);

                GameMessage message = GameMessage.playerMove(playerInfo);
                sessionHandler.broadcastToMap(playerInfo.getMapId(), message, playerId);
            }
        } catch (Exception e) {
            log.error("Error handling player move: {}", e.getMessage());
        }
    }

    private void handleChatMessage(Long playerId, JsonNode payload) {
        try {
            String message = payload.has("message") ? payload.get("message").asText() : null;
            if (message == null || message.trim().isEmpty()) return;

            PlayerInfo playerInfo = sessionManager.getPlayerInfo(playerId);
            if (playerInfo == null) return;

            GameMessage chatMessage = GameMessage.chat(playerInfo.getNickname(), message);
            sessionHandler.broadcastToMap(playerInfo.getMapId(), chatMessage, null);
        } catch (Exception e) {
            log.error("Error handling chat message: {}", e.getMessage());
        }
    }
}
