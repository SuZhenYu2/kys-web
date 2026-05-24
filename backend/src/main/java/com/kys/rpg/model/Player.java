package com.kys.rpg.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank
    @Size(max = 100)
    private String passwordHash;

    @NotBlank
    @Size(max = 50)
    private String nickname;

    @Email
    @Size(max = 100)
    private String email;

    private Integer level = 1;
    private Long experience = 0L;

    private Integer hp = 1000;
    private Integer hpMax = 1000;
    private Integer mp = 500;
    private Integer mpMax = 500;

    private Integer strength = 10;
    private Integer constitution = 10;
    private Integer agility = 10;
    private Integer intelligence = 10;
    private Integer luck = 10;

    private String mapId = "xiangyang";
    private Integer positionX = 1000;
    private Integer positionY = 1000;

    private Long silver = 1000L;
    private Long gold = 0L;
    private Long reputation = 0L;

    private Long factionId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}