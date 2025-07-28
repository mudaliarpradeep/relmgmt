package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "sample_entity")
public class SampleEntity extends BaseEntity {
    @Column(nullable = false)
    private String name;

    public SampleEntity() {}

    public SampleEntity(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
} 