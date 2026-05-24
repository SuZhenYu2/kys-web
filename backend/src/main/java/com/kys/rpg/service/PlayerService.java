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
