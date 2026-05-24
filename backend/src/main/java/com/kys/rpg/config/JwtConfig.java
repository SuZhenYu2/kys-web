package com.kys.rpg.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "kys.jwt")
public class JwtConfig {
    
    private String secret = "your-256-bit-secret-key-for-jwt-signing-minimum-32-chars";
    private long expirationMs = 86400000; // 24 hours
    private String tokenPrefix = "Bearer ";
    private String headerString = "Authorization";
}
