package com.kys.rpg.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PositionUpdateRequest {
    @NotNull(message = "X坐标不能为空")
    private Integer x;
    
    @NotNull(message = "Y坐标不能为空")
    private Integer y;
    
    private String mapId;
}
