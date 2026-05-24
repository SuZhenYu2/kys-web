package com.kys.rpg.security;

import com.kys.rpg.model.Player;
import com.kys.rpg.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PlayerRepository playerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Player player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

        return new User(
                player.getUsername(),
                player.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_PLAYER"))
        );
    }
}
