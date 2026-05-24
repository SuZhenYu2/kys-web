package com.kys.rpg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionUpdateResponse {
    private boolean success;
    private Integer x;
    private Integer y;
    private String mapId;
    private String message;
}
