package com.polycoder.relmgmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RelmgmtApplication {

    public static void main(String[] args) {
        SpringApplication.run(RelmgmtApplication.class, args);
    }

} 