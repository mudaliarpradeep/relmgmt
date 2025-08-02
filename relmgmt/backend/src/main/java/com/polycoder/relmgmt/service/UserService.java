package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.LoginRequest;
import com.polycoder.relmgmt.dto.LoginResponse;
import com.polycoder.relmgmt.dto.UserResponse;
import com.polycoder.relmgmt.entity.User;

public interface UserService {

    /**
     * Authenticate a user with username and password
     * @param loginRequest the login request containing username and password
     * @return the login response with JWT token
     */
    LoginResponse authenticate(LoginRequest loginRequest);

    /**
     * Get current user information
     * @param username the username
     * @return the user response
     */
    UserResponse getCurrentUser(String username);

    /**
     * Find a user by username
     * @param username the username
     * @return the user if found
     */
    User findByUsername(String username);

    /**
     * Create a new user
     * @param user the user to create
     * @return the created user
     */
    User createUser(User user);

    /**
     * Update an existing user
     * @param user the user to update
     * @return the updated user
     */
    User updateUser(User user);

    /**
     * Delete a user by ID
     * @param id the user ID
     */
    void deleteUser(Long id);
} 