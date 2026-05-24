package com.kys.rpg.config;

import com.kys.rpg.model.Map;
import com.kys.rpg.model.MapTile;
import com.kys.rpg.repository.MapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final MapRepository mapRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (!mapRepository.existsByMapId("xiangyang")) {
            createXiangyangMap();
            log.info("襄阳城地图初始化完成");
        }
    }
    
    private void createXiangyangMap() {
        Map map = Map.builder()
                .mapId("xiangyang")
                .name("襄阳城")
                .description("南宋边防重镇，郭靖、黄蓉驻守之地")
                .width(100)
                .height(100)
                .backgroundColor("#2d4a3e")
                .build();
        
        Set<MapTile> tiles = new HashSet<>();
        
        for (int x = 0; x < 100; x++) {
            for (int y = 0; y < 100; y++) {
                String color = (x + y) % 2 == 0 ? "#3d5a4e" : "#4d6a5e";
                boolean walkable = true;
                
                if (x == 0 || x == 99 || y == 0 || y == 99) {
                    color = "#5a4a3e";
                    walkable = false;
                }
                
                if (x >= 40 && x <= 60 && y >= 40 && y <= 60) {
                    color = "#7a6a5e";
                }
                
                tiles.add(MapTile.builder()
                        .map(map)
                        .x(x)
                        .y(y)
                        .type("grass")
                        .walkable(walkable)
                        .solid(!walkable)
                        .tileColor(color)
                        .build());
            }
        }
        
        map.setTiles(tiles);
        mapRepository.save(map);
    }
}
