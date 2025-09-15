package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.NotificationResponse;
import com.polycoder.relmgmt.entity.EventTypeEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationResponse> getNotificationsForCurrentUser(Boolean isRead, EventTypeEnum eventType, Pageable pageable);

    void markAsRead(Long id);

    void markAllAsReadForCurrentUser();

    void delete(Long id);
}


