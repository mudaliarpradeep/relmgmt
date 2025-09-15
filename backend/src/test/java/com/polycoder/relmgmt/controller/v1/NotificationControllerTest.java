package com.polycoder.relmgmt.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polycoder.relmgmt.dto.NotificationResponse;
import com.polycoder.relmgmt.entity.EventTypeEnum;
import com.polycoder.relmgmt.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private NotificationResponse notification;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        notification = new NotificationResponse();
        notification.setId(1L);
        notification.setEventType(EventTypeEnum.ALLOCATION_CONFLICT.name());
        notification.setEntityType("Resource");
        notification.setEntityId(10L);
        notification.setMessage("Resource Alice is over-allocated in week 2025-01-06");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetNotifications() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        Page<NotificationResponse> page = new PageImpl<>(Arrays.asList(notification), pageable, 1);

        when(notificationService.getNotificationsForCurrentUser(isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/notifications")
                        .param("page", "0")
                        .param("size", "20")
                        .param("sort", "createdAt,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].eventType").value("ALLOCATION_CONFLICT"))
                .andExpect(jsonPath("$.content[0].message").value("Resource Alice is over-allocated in week 2025-01-06"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testGetNotificationsWithFilters() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        Page<NotificationResponse> page = new PageImpl<>(Arrays.asList(notification), pageable, 1);

        when(notificationService.getNotificationsForCurrentUser(eq(true), eq(EventTypeEnum.BLOCKER_ADDED), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/notifications")
                        .param("isRead", "true")
                        .param("eventType", "BLOCKER_ADDED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].eventType").value("ALLOCATION_CONFLICT"));
    }

    @Test
    void testMarkAsRead() throws Exception {
        doNothing().when(notificationService).markAsRead(1L);

        mockMvc.perform(put("/api/v1/notifications/1/read")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testMarkAllAsRead() throws Exception {
        doNothing().when(notificationService).markAllAsReadForCurrentUser();

        mockMvc.perform(put("/api/v1/notifications/read-all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testDelete() throws Exception {
        doNothing().when(notificationService).delete(5L);

        mockMvc.perform(delete("/api/v1/notifications/5"))
                .andExpect(status().isOk());
    }
}


