package com.applytrack.dto;

import com.applytrack.entity.ApplicationStatus;

import java.time.LocalDate;

public class JobApplicationResponse {

    private Long id;
    private String jobTitle;
    private String jobDescription;
    private String applicationSource;
    private ApplicationStatus status;
    private LocalDate appliedAt;
    private LocalDate deadline;
    private LocalDate followUpDate;

    private Long companyId;
    private String companyName;

    public JobApplicationResponse() {
    }

    public JobApplicationResponse(
            Long id,
            String jobTitle,
            String jobDescription,
            String applicationSource,
            ApplicationStatus status,
            LocalDate appliedAt,
            LocalDate deadline,
            LocalDate followUpDate,
            Long companyId,
            String companyName
    ) {
        this.id = id;
        this.jobTitle = jobTitle;
        this.jobDescription = jobDescription;
        this.applicationSource = applicationSource;
        this.status = status;
        this.appliedAt = appliedAt;
        this.deadline = deadline;
        this.followUpDate = followUpDate;
        this.companyId = companyId;
        this.companyName = companyName;
    }

    public Long getId() {
        return id;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public String getApplicationSource() {
        return applicationSource;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDate getAppliedAt() {
        return appliedAt;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }
}