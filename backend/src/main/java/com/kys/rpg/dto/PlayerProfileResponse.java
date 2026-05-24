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
