
package com.studyspace.controller;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.studyspace.model.User;
import com.studyspace.repo.UserRepository;
import com.studyspace.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository u, PasswordEncoder e, JwtService j) {
        users = u;
        encoder = e;
        jwt = j;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> b) {

        String name = trim(b.get("name"));
        String email = trim(b.get("email")).toLowerCase();
        String pw = b.getOrDefault("password", "");

        if (name.isBlank() || email.isBlank() || pw.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email, and password are required"));
        }

        if (!Pattern.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid email address"));
        }

        if (pw.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 6 characters"));
        }

        if (users.existsByEmail(email)) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "An account with this email already exists"));
        }

        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(pw));

        users.save(u);

        return ResponseEntity.status(201).body(response(u));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> b) {

        String email = trim(b.get("email")).toLowerCase();
        User u = users.findByEmail(email).orElse(null);

        if (u == null || !encoder.matches(
                b.getOrDefault("password", ""), u.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid email or password"));
        }

        return ResponseEntity.ok(response(u));
    }

    private Map<String, Object> response(User u) {
        return Map.of(
                "token", jwt.create(u.getId()),
                "user", Map.of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail()
                )
        );
    }

    private String trim(String s) {
        return s == null ? "" : s.trim();
    }
}
