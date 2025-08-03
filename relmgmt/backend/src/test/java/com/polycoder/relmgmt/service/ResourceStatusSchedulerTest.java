package com.polycoder.relmgmt.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceStatusSchedulerTest {

    @Mock
    private ResourceService resourceService;

    @Mock
    private Logger logger;

    @InjectMocks
    private ResourceStatusScheduler resourceStatusScheduler;

    @BeforeEach
    void setUp() {
        // Mock the logger
        resourceStatusScheduler = new ResourceStatusScheduler();
        // Use reflection to inject the mocked service
        try {
            java.lang.reflect.Field serviceField = ResourceStatusScheduler.class.getDeclaredField("resourceService");
            serviceField.setAccessible(true);
            serviceField.set(resourceStatusScheduler, resourceService);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject mocked service", e);
        }
    }

    @Test
    void updateExpiredResourcesStatus_ShouldCallServiceMethod() {
        // Arrange
        when(resourceService.updateExpiredResourcesStatus()).thenReturn(2);

        // Act
        resourceStatusScheduler.updateExpiredResourcesStatus();

        // Assert
        verify(resourceService, times(1)).updateExpiredResourcesStatus();
    }

    @Test
    void updateExpiredResourcesStatus_ShouldHandleException() {
        // Arrange
        when(resourceService.updateExpiredResourcesStatus()).thenThrow(new RuntimeException("Database error"));

        // Act
        resourceStatusScheduler.updateExpiredResourcesStatus();

        // Assert
        verify(resourceService, times(1)).updateExpiredResourcesStatus();
        // The method should not throw an exception and should handle it gracefully
    }

    @Test
    void updateExpiredResourcesStatus_ShouldHandleZeroUpdates() {
        // Arrange
        when(resourceService.updateExpiredResourcesStatus()).thenReturn(0);

        // Act
        resourceStatusScheduler.updateExpiredResourcesStatus();

        // Assert
        verify(resourceService, times(1)).updateExpiredResourcesStatus();
    }
} 