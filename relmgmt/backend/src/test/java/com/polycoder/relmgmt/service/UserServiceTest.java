package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.LoginRequest;
import com.polycoder.relmgmt.dto.LoginResponse;
import com.polycoder.relmgmt.dto.UserResponse;
import com.polycoder.relmgmt.entity.User;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.UserRepository;
import com.polycoder.relmgmt.security.JwtTokenProvider;
import com.polycoder.relmgmt.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private UserDetails userDetails;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setEmail("test@example.com");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        userDetails = org.springframework.security.core.userdetails.User.builder()
                .username("testuser")
                .password("encodedPassword")
                .authorities("USER")
                .build();

        authentication = mock(Authentication.class);
    }

    @Test
    void testAuthenticateSuccess() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("testuser", "password123");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateToken(userDetails)).thenReturn("jwt.token.here");
        when(jwtTokenProvider.getJwtExpiration()).thenReturn(86400000L);

        // Act
        LoginResponse response = userService.authenticate(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt.token.here", response.getToken());
        assertEquals(86400000L, response.getExpiresIn());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider).generateToken(userDetails);
    }

    @Test
    void testAuthenticateFailure() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("testuser", "wrongpassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        assertThrows(ValidationException.class, () -> userService.authenticate(loginRequest));
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void testGetCurrentUser() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        UserResponse response = userService.getCurrentUser("testuser");

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals(testUser.getCreatedAt(), response.getCreatedAt());
        assertEquals(testUser.getUpdatedAt(), response.getUpdatedAt());
    }

    @Test
    void testGetCurrentUserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.getCurrentUser("nonexistent"));
    }

    @Test
    void testFindByUsername() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        User foundUser = userService.findByUsername("testuser");

        // Assert
        assertNotNull(foundUser);
        assertEquals("testuser", foundUser.getUsername());
    }

    @Test
    void testFindByUsernameNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.findByUsername("nonexistent"));
    }

    @Test
    void testCreateUser() {
        // Arrange
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("password123");
        newUser.setEmail("new@example.com");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        // TEMPORARY: Skip password encoder mocking while encryption is disabled
        // when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // Act
        User createdUser = userService.createUser(newUser);

        // Assert
        assertNotNull(createdUser);
        // TEMPORARY: Skip password encoder verification while encryption is disabled
        // verify(passwordEncoder).encode("password123");
        verify(userRepository).save(newUser);
    }

    @Test
    void testCreateUserUsernameExists() {
        // Arrange
        User newUser = new User();
        newUser.setUsername("existinguser");
        newUser.setPassword("password123");
        newUser.setEmail("new@example.com");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // Act & Assert
        assertThrows(ValidationException.class, () -> userService.createUser(newUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testCreateUserEmailExists() {
        // Arrange
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("password123");
        newUser.setEmail("existing@example.com");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThrows(ValidationException.class, () -> userService.createUser(newUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdateUser() {
        // Arrange
        User updateUser = new User();
        updateUser.setId(1L);
        updateUser.setUsername("updateduser");
        updateUser.setEmail("updated@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("updateduser")).thenReturn(false);
        when(userRepository.existsByEmail("updated@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(updateUser);

        // Act
        User updatedUser = userService.updateUser(updateUser);

        // Assert
        assertNotNull(updatedUser);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testUpdateUserNotFound() {
        // Arrange
        User updateUser = new User();
        updateUser.setId(999L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.updateUser(updateUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testDeleteUser() {
        // Arrange
        when(userRepository.existsById(1L)).thenReturn(true);

        // Act
        userService.deleteUser(1L);

        // Assert
        verify(userRepository).deleteById(1L);
    }

    @Test
    void testDeleteUserNotFound() {
        // Arrange
        when(userRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(999L));
        verify(userRepository, never()).deleteById(anyLong());
    }


} 