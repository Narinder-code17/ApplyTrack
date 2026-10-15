package com.applytrack.dto;

import java.time.LocalDate;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private boolean completed;
    private Long applicationId;
    private String priority;

    public TaskResponse() {
    }

    public TaskResponse(
            Long id,
            String title,
            String description,
            LocalDate dueDate,
            boolean completed,
            Long applicationId,
            String priority) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = completed;
        this.applicationId = applicationId;
        this.priority = priority;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public String getPriority() {
        return priority;
    }
}