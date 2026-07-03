package com.artesa.admin;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository repo;

    public AdminUserDetailsService(AdminUserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AdminUser u = repo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + email));
        return new User(
            u.getEmail(),
            u.getPasswordHash(),
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }
}
