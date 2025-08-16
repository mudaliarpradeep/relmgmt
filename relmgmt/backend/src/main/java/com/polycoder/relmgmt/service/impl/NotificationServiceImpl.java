package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.NotificationResponse;
import com.polycoder.relmgmt.entity.EventTypeEnum;
import com.polycoder.relmgmt.entity.Notification;
import com.polycoder.relmgmt.entity.User;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.repository.NotificationRepository;
import com.polycoder.relmgmt.repository.UserRepository;
import com.polycoder.relmgmt.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Page<NotificationResponse> getNotificationsForCurrentUser(Boolean isRead, EventTypeEnum eventType, Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Notification> page;
        if (eventType != null && isRead != null) {
            page = notificationRepository.findByUserAndEventTypeAndIsRead(currentUser, eventType, isRead, pageable);
        } else if (eventType != null) {
            page = notificationRepository.findByUserAndEventType(currentUser, eventType, pageable);
        } else if (isRead != null) {
            page = notificationRepository.findByUserAndIsRead(currentUser, isRead, pageable);
        } else {
            page = notificationRepository.findByUser(currentUser, pageable);
        }
        return page.map(this::toDto);
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (Boolean.TRUE.equals(notification.getIsRead())) {
            return;
        }
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsReadForCurrentUser() {
        User currentUser = getCurrentUser();
        // Iterate through user page by page to avoid memory issues in large datasets
        Pageable pageable = Pageable.unpaged();
        notificationRepository.findByUserAndIsRead(currentUser, false, pageable)
                .forEach(n -> {
                    n.setIsRead(true);
                    n.setReadAt(LocalDateTime.now());
                    notificationRepository.save(n);
                });
    }

    @Override
    public void delete(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }

    private NotificationResponse toDto(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId());
        dto.setEventType(n.getEventType().name());
        dto.setEntityType(n.getEntityType());
        dto.setEntityId(n.getEntityId());
        dto.setMessage(n.getMessage());
        dto.setRead(Boolean.TRUE.equals(n.getIsRead()));
        dto.setCreatedAt(n.getCreatedAt());
        dto.setReadAt(n.getReadAt());
        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}


