package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.EventTypeEnum;
import com.polycoder.relmgmt.entity.Notification;
import com.polycoder.relmgmt.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUser(User user, Pageable pageable);

    Page<Notification> findByUserAndIsRead(User user, boolean isRead, Pageable pageable);

    Page<Notification> findByUserAndEventType(User user, EventTypeEnum eventType, Pageable pageable);

    Page<Notification> findByUserAndEventTypeAndIsRead(User user, EventTypeEnum eventType, boolean isRead, Pageable pageable);

    long countByUserAndIsRead(User user, boolean isRead);
}


