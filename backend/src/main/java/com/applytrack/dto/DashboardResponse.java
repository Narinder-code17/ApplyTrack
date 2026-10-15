package com.applytrack.dto;

public class DashboardResponse {

    private long totalApplications;
    private long saved;
    private long applied;
    private long screening;
    private long assessment;
    private long technicalInterview;
    private long hrInterview;
    private long interviews;
    private long offers;
    private long rejected;
    private long withdrawn;

    public DashboardResponse() {
    }

    public DashboardResponse(
            long totalApplications,
            long saved,
            long applied,
            long screening,
            long assessment,
            long technicalInterview,
            long hrInterview,
            long interviews,
            long offers,
            long rejected,
            long withdrawn
    ) {
        this.totalApplications = totalApplications;
        this.saved = saved;
        this.applied = applied;
        this.screening = screening;
        this.assessment = assessment;
        this.technicalInterview = technicalInterview;
        this.hrInterview = hrInterview;
        this.interviews = interviews;
        this.offers = offers;
        this.rejected = rejected;
        this.withdrawn = withdrawn;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public long getSaved() {
        return saved;
    }

    public long getApplied() {
        return applied;
    }

    public long getScreening() {
        return screening;
    }

    public long getAssessment() {
        return assessment;
    }

    public long getTechnicalInterview() {
        return technicalInterview;
    }

    public long getHrInterview() {
        return hrInterview;
    }

    public long getInterviews() {
        return interviews;
    }

    public long getOffers() {
        return offers;
    }

    public long getRejected() {
        return rejected;
    }

    public long getWithdrawn() {
        return withdrawn;
    }
}