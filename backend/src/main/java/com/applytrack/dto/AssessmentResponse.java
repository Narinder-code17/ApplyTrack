package com.applytrack.dto;

import java.time.LocalDateTime;

public class AssessmentResponse {

    private Long id;
    private String assessmentName;
    private String type;
    private LocalDateTime deadline;
    private String status;
    private Double score;
    private String assessmentLink;
    private String notes;

    public AssessmentResponse() {
    }

    public AssessmentResponse(
            Long id,
            String assessmentName,
            String type,
            LocalDateTime deadline,
            String status,
            Double score,
            String assessmentLink,
            String notes) {

        this.id = id;
        this.assessmentName = assessmentName;
        this.type = type;
        this.deadline = deadline;
        this.status = status;
        this.score = score;
        this.assessmentLink = assessmentLink;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public String getAssessmentName() {
        return assessmentName;
    }

    public String getType() {
        return type;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public String getStatus() {
        return status;
    }

    public Double getScore() {
        return score;
    }

    public String getAssessmentLink() {
        return assessmentLink;
    }

    public String getNotes() {
        return notes;
    }
}