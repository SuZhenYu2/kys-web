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
