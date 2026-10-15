package com.applytrack.dto;

import java.time.LocalDateTime;

public class ApplicationEventResponse {

    private Long id;
    private String eventType;
    private String description;
    private LocalDateTime eventDate;
    private LocalDateTime createdAt;

    public ApplicationEventResponse() {
    }

    public ApplicationEventResponse(
            Long id,
            String eventType,
            String description,
            LocalDateTime eventDate,
            LocalDateTime createdAt) {

        this.id = id;
        this.eventType = eventType;
        this.description = description;
        this.eventDate = eventDate;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEventType() {
        return eventType;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}