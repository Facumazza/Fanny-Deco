package com.artesa.admin;

import com.artesa.common.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final SecurityContextRepository contextRepo =
        new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authManager) {
        this.authManager = authManager;
    }

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}

    public record CurrentUser(String email) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest req,
                                   HttpServletRequest servletReq,
                                   HttpServletResponse servletResp) {
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);
            // Persist the SecurityContext into the HTTP session so subsequent requests
            // are authenticated by the session cookie.
            contextRepo.saveContext(ctx, servletReq, servletResp);
            return ResponseEntity.ok(new CurrentUser(auth.getName()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                .body(ApiError.of("INVALID_CREDENTIALS", "Email o contraseña inválidos"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUser> me(Authentication auth) {
        return ResponseEntity.ok(new CurrentUser(auth.getName()));
    }
}
