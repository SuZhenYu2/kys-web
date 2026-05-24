package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMessage {
    private GameMessageType type;
    private Object data;
    private long timestamp;

    public static GameMessage playerJoin(PlayerInfo player) {
        return GameMessage.builder()
                .type(GameMessageType.PLAYER_JOIN)
                .data(player)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static GameMessage playerLeave(PlayerInfo player) {
        return GameMessage.builder()
                .type(GameMessageType.PLAYER_LEAVE)
                .data(player)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static GameMessage playerMove(PlayerInfo player) {
        return GameMessage.builder()
                .type(GameMessageType.PLAYER_MOVE)
                .data(player)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static GameMessage chat(String sender, String message) {
        ChatMessage chatMsg = new ChatMessage(sender, message);
        return GameMessage.builder()
                .type(GameMessageType.CHAT)
                .data(chatMsg)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatMessage {
        private String sender;
        private String message;
    }
}
