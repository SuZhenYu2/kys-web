package com.kys.rpg.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "map_tiles")
public class MapTile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private Map map;
    
    @Column(nullable = false)
    private Integer x;
    
    @Column(nullable = false)
    private Integer y;
    
    @Column(length = 20)
    private String type;
    
    @Column(name = "is_walkable")
    @Builder.Default
    private Boolean walkable = true;
    
    @Column(name = "is_solid")
    @Builder.Default
    private Boolean solid = false;
    
    @Column(name = "tile_color", length = 20)
    private String tileColor;
}
