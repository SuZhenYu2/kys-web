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
