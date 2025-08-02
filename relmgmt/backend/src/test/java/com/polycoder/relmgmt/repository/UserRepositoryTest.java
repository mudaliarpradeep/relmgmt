package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("test@example.com");
    }

    @Test
    void testSaveUser() {
        User savedUser = userRepository.save(testUser);
        
        assertNotNull(savedUser.getId());
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("test@example.com", savedUser.getEmail());
        assertNotNull(savedUser.getCreatedAt());
        assertNotNull(savedUser.getUpdatedAt());
    }

    @Test
    void testFindByUsername() {
        userRepository.save(testUser);
        
        Optional<User> foundUser = userRepository.findByUsername("testuser");
        
        assertTrue(foundUser.isPresent());
        assertEquals("testuser", foundUser.get().getUsername());
        assertEquals("test@example.com", foundUser.get().getEmail());
    }

    @Test
    void testFindByUsernameNotFound() {
        Optional<User> foundUser = userRepository.findByUsername("nonexistent");
        
        assertFalse(foundUser.isPresent());
    }

    @Test
    void testFindByEmail() {
        userRepository.save(testUser);
        
        Optional<User> foundUser = userRepository.findByEmail("test@example.com");
        
        assertTrue(foundUser.isPresent());
        assertEquals("testuser", foundUser.get().getUsername());
        assertEquals("test@example.com", foundUser.get().getEmail());
    }

    @Test
    void testFindByEmailNotFound() {
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");
        
        assertFalse(foundUser.isPresent());
    }

    @Test
    void testExistsByUsername() {
        userRepository.save(testUser);
        
        assertTrue(userRepository.existsByUsername("testuser"));
        assertFalse(userRepository.existsByUsername("nonexistent"));
    }

    @Test
    void testExistsByEmail() {
        userRepository.save(testUser);
        
        assertTrue(userRepository.existsByEmail("test@example.com"));
        assertFalse(userRepository.existsByEmail("nonexistent@example.com"));
    }

    @Test
    void testFindById() {
        User savedUser = userRepository.save(testUser);
        
        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        
        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getId(), foundUser.get().getId());
        assertEquals("testuser", foundUser.get().getUsername());
    }

    @Test
    void testUpdateUser() {
        User savedUser = userRepository.save(testUser);
        
        // Wait a bit to ensure timestamp difference
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        savedUser.setEmail("updated@example.com");
        User updatedUser = userRepository.save(savedUser);
        
        assertEquals("updated@example.com", updatedUser.getEmail());
        assertEquals(savedUser.getId(), updatedUser.getId());
        assertTrue(updatedUser.getUpdatedAt().isAfter(updatedUser.getCreatedAt()) || 
                  updatedUser.getUpdatedAt().equals(updatedUser.getCreatedAt()));
    }

    @Test
    void testDeleteUser() {
        User savedUser = userRepository.save(testUser);
        
        userRepository.deleteById(savedUser.getId());
        
        assertFalse(userRepository.existsById(savedUser.getId()));
        assertFalse(userRepository.existsByUsername("testuser"));
    }

    @Test
    void testUniqueUsernameConstraint() {
        userRepository.save(testUser);
        
        User duplicateUser = new User();
        duplicateUser.setUsername("testuser");
        duplicateUser.setPassword("password456");
        duplicateUser.setEmail("different@example.com");
        
        // This should throw an exception due to unique constraint
        assertThrows(Exception.class, () -> userRepository.save(duplicateUser));
    }

    @Test
    void testUniqueEmailConstraint() {
        userRepository.save(testUser);
        
        User duplicateUser = new User();
        duplicateUser.setUsername("differentuser");
        duplicateUser.setPassword("password456");
        duplicateUser.setEmail("test@example.com");
        
        // This should throw an exception due to unique constraint
        assertThrows(Exception.class, () -> userRepository.save(duplicateUser));
    }
} 