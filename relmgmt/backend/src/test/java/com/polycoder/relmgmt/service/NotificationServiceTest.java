package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.NotificationResponse;
import com.polycoder.relmgmt.entity.EventTypeEnum;
import com.polycoder.relmgmt.entity.Notification;
import com.polycoder.relmgmt.entity.User;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.repository.NotificationRepository;
import com.polycoder.relmgmt.repository.UserRepository;
import com.polycoder.relmgmt.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        lenient().when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    }

    @Test
    void testGetNotifications_NoFilters() {
        Notification n = new Notification();
        n.setId(1L);
        n.setUser(user);
        n.setEventType(EventTypeEnum.ALLOCATION_CONFLICT);
        n.setEntityType("Resource");
        n.setEntityId(1L);
        n.setMessage("Allocation conflict");
        n.setIsRead(false);
        n.setReadAt(null);
        n.setCreatedAt(LocalDateTime.now());

        Page<Notification> page = new PageImpl<>(Arrays.asList(n), PageRequest.of(0, 20), 1);
        when(notificationRepository.findByUser(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponse> result = notificationService.getNotificationsForCurrentUser(null, null, PageRequest.of(0, 20));
        assertEquals(1, result.getTotalElements());
        assertEquals("ALLOCATION_CONFLICT", result.getContent().get(0).getEventType());
        verify(notificationRepository).findByUser(eq(user), any(Pageable.class));
    }

    @Test
    void testGetNotifications_WithFilters() {
        Page<Notification> page = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 20), 0);
        when(notificationRepository.findByUserAndEventTypeAndIsRead(eq(user), eq(EventTypeEnum.BLOCKER_ADDED), eq(true), any(Pageable.class)))
                .thenReturn(page);

        Page<NotificationResponse> result = notificationService.getNotificationsForCurrentUser(true, EventTypeEnum.BLOCKER_ADDED, PageRequest.of(0, 20));
        assertEquals(0, result.getTotalElements());
        verify(notificationRepository).findByUserAndEventTypeAndIsRead(eq(user), eq(EventTypeEnum.BLOCKER_ADDED), eq(true), any(Pageable.class));
    }

    @Test
    void testMarkAsRead() {
        Notification n = new Notification();
        n.setId(5L);
        n.setIsRead(false);
        when(notificationRepository.findById(5L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> notificationService.markAsRead(5L));
        assertTrue(n.getIsRead());
        assertNotNull(n.getReadAt());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void testMarkAsRead_NotFound() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead(99L));
    }

    @Test
    void testMarkAllAsReadForCurrentUser() {
        Notification n1 = new Notification();
        n1.setIsRead(false);
        Notification n2 = new Notification();
        n2.setIsRead(false);

        Page<Notification> page = new PageImpl<>(Arrays.asList(n1, n2));
        when(notificationRepository.findByUserAndIsRead(eq(user), eq(false), any(Pageable.class))).thenReturn(page);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.markAllAsReadForCurrentUser();
        assertTrue(n1.getIsRead());
        assertTrue(n2.getIsRead());
        assertNotNull(n1.getReadAt());
        assertNotNull(n2.getReadAt());
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void testDelete() {
        when(notificationRepository.existsById(7L)).thenReturn(true);
        assertDoesNotThrow(() -> notificationService.delete(7L));
        verify(notificationRepository).deleteById(7L);
    }

    @Test
    void testDelete_NotFound() {
        when(notificationRepository.existsById(7L)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> notificationService.delete(7L));
    }
}


