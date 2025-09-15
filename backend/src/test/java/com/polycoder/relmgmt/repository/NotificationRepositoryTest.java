package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.EventTypeEnum;
import com.polycoder.relmgmt.entity.Notification;
import com.polycoder.relmgmt.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class NotificationRepositoryTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("notifuser");
        user.setEmail("notif@example.com");
        user.setPassword("password");
        user = userRepository.save(user);

        Notification n1 = new Notification();
        n1.setUser(user);
        n1.setEventType(EventTypeEnum.ALLOCATION_CONFLICT);
        n1.setEntityType("Resource");
        n1.setEntityId(1L);
        n1.setMessage("Allocation conflict");
        notificationRepository.save(n1);

        Notification n2 = new Notification();
        n2.setUser(user);
        n2.setEventType(EventTypeEnum.BLOCKER_ADDED);
        n2.setEntityType("Blocker");
        n2.setEntityId(2L);
        n2.setMessage("Blocker added");
        n2.setIsRead(true);
        notificationRepository.save(n2);
    }

    @Test
    void testFindByUser() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Notification> page = notificationRepository.findByUser(user, pageable);
        assertEquals(2, page.getTotalElements());
    }

    @Test
    void testFindByUserAndIsRead() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Notification> page = notificationRepository.findByUserAndIsRead(user, true, pageable);
        assertEquals(1, page.getTotalElements());
        assertTrue(page.getContent().get(0).getIsRead());
    }

    @Test
    void testFindByUserAndEventType() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Notification> page = notificationRepository.findByUserAndEventType(user, EventTypeEnum.ALLOCATION_CONFLICT, pageable);
        assertEquals(1, page.getTotalElements());
        assertEquals(EventTypeEnum.ALLOCATION_CONFLICT, page.getContent().get(0).getEventType());
    }

    @Test
    void testFindByUserAndEventTypeAndIsRead() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Notification> page = notificationRepository.findByUserAndEventTypeAndIsRead(user, EventTypeEnum.BLOCKER_ADDED, true, pageable);
        assertEquals(1, page.getTotalElements());
        assertEquals(EventTypeEnum.BLOCKER_ADDED, page.getContent().get(0).getEventType());
        assertTrue(page.getContent().get(0).getIsRead());
    }
}


