package com.applytrack.controller;

import com.applytrack.dto.JobApplicationResponse;
import com.applytrack.dto.UpdateApplicationStatusRequest;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import com.applytrack.repository.UserRepository;
import com.applytrack.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserRepository userRepository;

    public JobApplicationController(
            JobApplicationService jobApplicationService,
            UserRepository userRepository) {
        this.jobApplicationService = jobApplicationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public JobApplicationResponse createApplication(
            Authentication authentication,
            @RequestParam Long companyId,
            @RequestBody JobApplication application) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication savedApplication =
                jobApplicationService.createApplication(
                        user.getId(),
                        companyId,
                        application
                );

        return convertToResponse(savedApplication);
    }

    @GetMapping
    public List<JobApplicationResponse> getApplications(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jobApplicationService
                .getApplicationsByUser(user.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @PatchMapping("/{applicationId}/status")
    public JobApplicationResponse updateApplicationStatus(
            @PathVariable Long applicationId,
            Authentication authentication,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {

        String email = authentication.getName();

        JobApplication updatedApplication =
                jobApplicationService.updateStatus(
                        applicationId,
                        email,
                        request.getStatus()
                );

        return convertToResponse(updatedApplication);
    }

    private JobApplicationResponse convertToResponse(
            JobApplication application) {

        return new JobApplicationResponse(
                application.getId(),
                application.getJobTitle(),
                application.getJobDescription(),
                application.getApplicationSource(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getDeadline(),
                application.getFollowUpDate(),
                application.getCompany().getId(),
                application.getCompany().getName()
        );
    }
}