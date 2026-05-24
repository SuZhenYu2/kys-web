package com.kys.rpg.repository;

import com.kys.rpg.model.Map;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MapRepository extends JpaRepository<Map, Long> {
    
    Optional<Map> findByMapId(String mapId);
    
    boolean existsByMapId(String mapId);
}
