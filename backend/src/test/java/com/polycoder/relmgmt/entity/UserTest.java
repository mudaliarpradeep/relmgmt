package com.polycoder.relmgmt.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    void testDefaultConstructor() {
        assertNotNull(user);
        assertNull(user.getUsername());
        assertNull(user.getPassword());
        assertNull(user.getEmail());
    }

    @Test
    void testParameterizedConstructor() {
        User testUser = new User("testuser", "password123", "test@example.com");
        
        assertEquals("testuser", testUser.getUsername());
        assertEquals("password123", testUser.getPassword());
        assertEquals("test@example.com", testUser.getEmail());
    }

    @Test
    void testUsernameGetterAndSetter() {
        String username = "testuser";
        user.setUsername(username);
        assertEquals(username, user.getUsername());
    }

    @Test
    void testPasswordGetterAndSetter() {
        String password = "password123";
        user.setPassword(password);
        assertEquals(password, user.getPassword());
    }

    @Test
    void testEmailGetterAndSetter() {
        String email = "test@example.com";
        user.setEmail(email);
        assertEquals(email, user.getEmail());
    }

    @Test
    void testIdGetterAndSetter() {
        Long id = 1L;
        user.setId(id);
        assertEquals(id, user.getId());
    }

    @Test
    void testCreatedAtGetterAndSetter() {
        user.setCreatedAt(java.time.LocalDateTime.now());
        assertNotNull(user.getCreatedAt());
    }

    @Test
    void testUpdatedAtGetterAndSetter() {
        user.setUpdatedAt(java.time.LocalDateTime.now());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void testToString() {
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setCreatedAt(java.time.LocalDateTime.of(2024, 1, 1, 12, 0));
        user.setUpdatedAt(java.time.LocalDateTime.of(2024, 1, 1, 12, 0));

        String result = user.toString();
        
        assertTrue(result.contains("User{"));
        assertTrue(result.contains("id=1"));
        assertTrue(result.contains("username='testuser'"));
        assertTrue(result.contains("email='test@example.com'"));
        assertTrue(result.contains("createdAt="));
        assertTrue(result.contains("updatedAt="));
    }

    @Test
    void testEqualsAndHashCode() {
        User user1 = new User("user1", "pass1", "user1@example.com");
        User user2 = new User("user1", "pass1", "user1@example.com");
        User user3 = new User("user2", "pass2", "user2@example.com");

        // Test equals
        assertEquals(user1, user1); // Same object
        assertNotEquals(user1, user2); // Different objects with same content (not implemented)
        assertNotEquals(user1, user3); // Different content

        // Test hashCode
        assertEquals(user1.hashCode(), user1.hashCode());
        assertNotEquals(user1.hashCode(), user3.hashCode());
    }
} 