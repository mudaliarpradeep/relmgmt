package com.polycoder.relmgmt.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("application", "Release Management System");
        response.put("version", "1.0.0");
        
        // Add database connectivity information
        Map<String, Object> database = new HashMap<>();
        try {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(5)) {
                    database.put("status", "UP");
                    database.put("connected", true);
                    database.put("database", connection.getMetaData().getDatabaseProductName());
                    database.put("driver", connection.getMetaData().getDriverName());
                } else {
                    database.put("status", "DOWN");
                    database.put("connected", false);
                    database.put("error", "Connection is not valid");
                }
            }
        } catch (SQLException e) {
            database.put("status", "DOWN");
            database.put("connected", false);
            database.put("error", e.getMessage());
        } catch (Exception e) {
            database.put("status", "DOWN");
            database.put("connected", false);
            database.put("error", "Unexpected error: " + e.getMessage());
        }
        
        response.put("database", database);
        
        return ResponseEntity.ok(response);
    }
} 