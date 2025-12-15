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
	
	// injected User repo so that this service can communicate with the user record in the database
	// the service should nit handle database logic directly 
	// As this service handles user authentication response it needs access to user data to cross check
    @Autowired
    private UserRepository userRepository;

    // BCrypt hashing function is used which applies strong hashing algo as we promise secure connection 
    // Spring security uses one of the password encoder interface BCryptPasswordEncoder to define how the passwords are stored and validated 
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // handles user registraion logic 
    public String registerUser(User user) {
    	// check if the email exist if yes returns Email exist message
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email already registered!";
        }
        // if not set the password for the user using the password encoder, encode (hash) the received password from the user and save it to DB
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully!"; // message after successful registration 
    }

    // Handles login logic accepts user email and password to authenticate 
    public AuthResponse loginUser(String email, String password) {
    	// when searching and fetching user by email, optional keyword helps to handle it safely 
    	// incase the user doesnt exist it must not crash
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        // check using IsPrsent method if the user found 
        if (existingUser.isPresent()) {
        	// extract user object using get method 
            User user = existingUser.get();
            // check if the user provided password mathces the password stored in the password encoder 
            if (passwordEncoder.matches(password, user.getPassword())) {
                return new AuthResponse(true, "Login successful!", user.getUsername()); // login success message
            }
        }
        return new AuthResponse(false, "Invalid email or password!", null); // if not failed login 
    }
}
