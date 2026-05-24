package com.kys.rpg.service;

import com.kys.rpg.dto.*;
import com.kys.rpg.model.Player;
import com.kys.rpg.repository.PlayerRepository;
import com.kys.rpg.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (playerRepository.existsByUsername(request.getUsername())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("用户名已存在")
                    .build();
        }

        if (playerRepository.existsByNickname(request.getNickname())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("昵称已被使用")
                    .build();
        }

        Player player = Player.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .email(request.getEmail())
                .level(1)
                .experience(0L)
                .hp(1000)
                .hpMax(1000)
                .mp(500)
                .mpMax(500)
                .strength(10)
                .constitution(10)
                .agility(10)
                .intelligence(10)
                .luck(10)
                .mapId("xiangyang")
                .positionX(1000)
                .positionY(1000)
                .silver(1000L)
                .gold(0L)
                .reputation(0L)
                .build();

        player = playerRepository.save(player);
        log.info("New player registered: {}", player.getUsername());

        return RegisterResponse.builder()
                .success(true)
                .message("注册成功")
                .playerId(player.getId())
                .username(player.getUsername())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = tokenProvider.generateToken(authentication);
        
        Player player = playerRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        log.info("Player logged in: {}", player.getUsername());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .player(LoginResponse.PlayerInfo.builder()
                        .id(player.getId())
                        .username(player.getUsername())
                        .nickname(player.getNickname())
                        .level(player.getLevel())
                        .build())
                .build();
    }
}
