package com.applytrack.controller;

import com.applytrack.dto.SmartInsightsResponse;
import com.applytrack.service.SmartInsightsService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
public class SmartInsightsController {

    private final SmartInsightsService smartInsightsService;

    public SmartInsightsController(
            SmartInsightsService smartInsightsService
    ) {
        this.smartInsightsService = smartInsightsService;
    }

    @GetMapping
    public SmartInsightsResponse getInsights(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return smartInsightsService.getInsights(email);
    }
}