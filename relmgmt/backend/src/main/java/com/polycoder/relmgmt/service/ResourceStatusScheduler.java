package com.polycoder.relmgmt.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Scheduled service for automatically updating resource statuses
 * based on business rules like project end dates
 */
@Service
public class ResourceStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ResourceStatusScheduler.class);

    @Autowired
    private ResourceService resourceService;

    /**
     * Scheduled job to automatically mark resources with past project end dates as inactive
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2:00 AM
    public void updateExpiredResourcesStatus() {
        try {
            logger.info("Starting scheduled task: Update expired resources status");
            
            int updatedCount = resourceService.updateExpiredResourcesStatus();
            
            if (updatedCount > 0) {
                logger.info("Successfully updated {} resources from ACTIVE to INACTIVE due to past project end dates", updatedCount);
            } else {
                logger.info("No resources found with past project end dates that need status update");
            }
            
        } catch (Exception e) {
            logger.error("Error occurred while updating expired resources status: {}", e.getMessage(), e);
        }
    }
} 