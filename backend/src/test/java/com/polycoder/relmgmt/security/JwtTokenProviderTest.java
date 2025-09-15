package com.polycoder.relmgmt.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", 
            "testSecretKey123456789012345678901234567890123456789012345678901234567890");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 86400000L); // 24 hours

        userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities("USER")
                .build();
    }

    @Test
    void testGenerateTokenWithUserDetails() {
        String token = jwtTokenProvider.generateToken(userDetails);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void testGenerateTokenWithUsername() {
        String token = jwtTokenProvider.generateToken("testuser");
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void testExtractUsername() {
        String token = jwtTokenProvider.generateToken("testuser");
        String username = jwtTokenProvider.extractUsername(token);
        
        assertEquals("testuser", username);
    }

    @Test
    void testExtractExpiration() {
        String token = jwtTokenProvider.generateToken("testuser");
        Date expiration = jwtTokenProvider.extractExpiration(token);
        
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void testValidateTokenWithUserDetails() {
        String token = jwtTokenProvider.generateToken(userDetails);
        boolean isValid = jwtTokenProvider.validateToken(token, userDetails);
        
        assertTrue(isValid);
    }

    @Test
    void testValidateTokenWithUsername() {
        String token = jwtTokenProvider.generateToken("testuser");
        boolean isValid = jwtTokenProvider.validateToken(token, "testuser");
        
        assertTrue(isValid);
    }

    @Test
    void testValidateTokenWithWrongUsername() {
        String token = jwtTokenProvider.generateToken("testuser");
        boolean isValid = jwtTokenProvider.validateToken(token, "wronguser");
        
        assertFalse(isValid);
    }

    @Test
    void testValidateTokenWithExpiredToken() {
        // Set a very short expiration time
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 1L);
        
        String token = jwtTokenProvider.generateToken("testuser");
        
        // Wait for token to expire
        try {
            Thread.sleep(20);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // For expired tokens, we expect an exception when trying to validate
        assertThrows(Exception.class, () -> jwtTokenProvider.validateToken(token, "testuser"));
    }

    @Test
    void testIsTokenExpired() {
        String token = jwtTokenProvider.generateToken("testuser");
        boolean isExpired = jwtTokenProvider.isTokenExpired(token);
        
        assertFalse(isExpired);
    }

    @Test
    void testGetJwtExpiration() {
        long expiration = jwtTokenProvider.getJwtExpiration();
        
        assertEquals(86400000L, expiration);
    }

    @Test
    void testExtractClaim() {
        String token = jwtTokenProvider.generateToken("testuser");
        String subject = jwtTokenProvider.extractClaim(token, claims -> claims.getSubject());
        
        assertEquals("testuser", subject);
    }

    @Test
    void testInvalidToken() {
        String invalidToken = "invalid.token.here";
        
        assertThrows(Exception.class, () -> jwtTokenProvider.extractUsername(invalidToken));
    }

    @Test
    void testNullToken() {
        assertThrows(Exception.class, () -> jwtTokenProvider.extractUsername(null));
    }

    @Test
    void testEmptyToken() {
        assertThrows(Exception.class, () -> jwtTokenProvider.extractUsername(""));
    }
} 