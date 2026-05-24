package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapResponse {
    
    private String mapId;
    private String name;
    private String description;
    private Integer width;
    private Integer height;
    private String backgroundColor;
    private List<TileData> tiles;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TileData {
        private Integer x;
        private Integer y;
        private String type;
        private Boolean walkable;
        private Boolean solid;
        private String color;
    }
}
