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
