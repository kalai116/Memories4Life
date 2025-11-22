package com.example.MeForLife.services;


import com.example.MeForLife.entity.AuthResponse;
import com.example.MeForLife.entity.User;
import com.example.MeForLife.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email already registered!";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully!";
    }

    public AuthResponse loginUser(String email, String password) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return new AuthResponse(true, "Login successful!", user.getUsername());
            }
        }
        return new AuthResponse(false, "Invalid email or password!", null);
    }
}
