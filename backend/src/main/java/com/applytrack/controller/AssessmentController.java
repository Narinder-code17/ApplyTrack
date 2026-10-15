package com.applytrack.controller;

import com.applytrack.dto.AssessmentResponse;
import com.applytrack.entity.Assessment;
import com.applytrack.service.AssessmentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/{applicationId}/assessments")
    public AssessmentResponse createAssessment(
            @PathVariable Long applicationId,
            Authentication authentication,
            @RequestBody Assessment assessment) {

        String email = authentication.getName();

        Assessment savedAssessment =
                assessmentService.createAssessment(
                        applicationId,
                        email,
                        assessment
                );

        return convertToResponse(savedAssessment);
    }

    @GetMapping("/{applicationId}/assessments")
    public List<AssessmentResponse> getAssessments(
            @PathVariable Long applicationId,
            Authentication authentication) {

        String email = authentication.getName();

        return assessmentService
                .getAssessmentsByApplication(applicationId, email)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @PutMapping("/{applicationId}/assessments/{assessmentId}")
    public AssessmentResponse updateAssessment(
            @PathVariable Long applicationId,
            @PathVariable Long assessmentId,
            Authentication authentication,
            @RequestBody Assessment assessment) {

        String email = authentication.getName();

        Assessment updatedAssessment =
                assessmentService.updateAssessment(
                        applicationId,
                        assessmentId,
                        email,
                        assessment
                );

        return convertToResponse(updatedAssessment);
    }

    @DeleteMapping("/{applicationId}/assessments/{assessmentId}")
    public void deleteAssessment(
            @PathVariable Long applicationId,
            @PathVariable Long assessmentId,
            Authentication authentication) {

        String email = authentication.getName();

        assessmentService.deleteAssessment(
                applicationId,
                assessmentId,
                email
        );
    }

    private AssessmentResponse convertToResponse(
            Assessment assessment) {

        return new AssessmentResponse(
                assessment.getId(),
                assessment.getAssessmentName(),
                assessment.getType(),
                assessment.getDeadline(),
                assessment.getStatus(),
                assessment.getScore(),
                assessment.getAssessmentLink(),
                assessment.getNotes()
        );
    }

}