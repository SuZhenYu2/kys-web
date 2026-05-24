package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerInfo {
    private Long id;
    private String username;
    private String nickname;
    private Integer level;
    private Integer x;
    private Integer y;
    private String mapId;
}
