package com.applytrack.dto;

public class SmartInsightsResponse {

    private String priority;
    private String recommendation;

    public SmartInsightsResponse() {
    }

    public SmartInsightsResponse(
            String priority,
            String recommendation
    ) {
        this.priority = priority;
        this.recommendation = recommendation;
    }

    public String getPriority() {
        return priority;
    }

    public String getRecommendation() {
        return recommendation;
    }
}