package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.LoginRequest;
import com.polycoder.relmgmt.dto.LoginResponse;
import com.polycoder.relmgmt.dto.UserResponse;
import com.polycoder.relmgmt.entity.User;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.UserRepository;
import com.polycoder.relmgmt.security.JwtTokenProvider;
import com.polycoder.relmgmt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse authenticate(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);

            User user = findByUsername(userDetails.getUsername());

            return new LoginResponse(
                token,
                jwtTokenProvider.getJwtExpiration(),
                user.getUsername(),
                user.getEmail()
            );
        } catch (BadCredentialsException e) {
            throw new ValidationException("Invalid username or password");
        }
    }

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = findByUsername(username);
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    @Override
    public User createUser(User user) {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ValidationException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // TEMPORARY: Skip password encoding for testing - NEVER USE IN PRODUCTION!
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) {
        User existingUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + user.getId()));

        // Check if username is being changed and if it already exists
        if (!existingUser.getUsername().equals(user.getUsername()) && 
            userRepository.existsByUsername(user.getUsername())) {
            throw new ValidationException("Username already exists");
        }

        // Check if email is being changed and if it already exists
        if (!existingUser.getEmail().equals(user.getEmail()) && 
            userRepository.existsByEmail(user.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // Update fields
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());

        // Only update password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            // TEMPORARY: Skip password encoding for testing - NEVER USE IN PRODUCTION!
            existingUser.setPassword(user.getPassword());
            // existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }


} 