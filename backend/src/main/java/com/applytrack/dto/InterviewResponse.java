package com.applytrack.dto;

import java.time.LocalDateTime;

public class InterviewResponse {

    private Long id;
    private String roundName;
    private LocalDateTime scheduledAt;
    private String mode;
    private String meetingLink;
    private String notes;
    private String status;

    public InterviewResponse() {
    }

    public InterviewResponse(
            Long id,
            String roundName,
            LocalDateTime scheduledAt,
            String mode,
            String meetingLink,
            String notes,
            String status) {

        this.id = id;
        this.roundName = roundName;
        this.scheduledAt = scheduledAt;
        this.mode = mode;
        this.meetingLink = meetingLink;
        this.notes = notes;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getRoundName() {
        return roundName;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public String getMode() {
        return mode;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public String getNotes() {
        return notes;
    }

    public String getStatus() {
        return status;
    }
}