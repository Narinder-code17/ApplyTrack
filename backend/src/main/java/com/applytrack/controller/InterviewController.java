
package com.applytrack.controller;

import com.applytrack.dto.InterviewResponse;
import com.applytrack.entity.Interview;
import com.applytrack.service.InterviewService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/{applicationId}/interviews")
    public InterviewResponse createInterview(
            @PathVariable Long applicationId,
            Authentication authentication,
            @RequestBody Interview interview) {

        Interview savedInterview =
                interviewService.createInterview(
                        applicationId,
                        authentication.getName(),
                        interview
                );

        return convertToResponse(savedInterview);
    }

    @GetMapping("/{applicationId}/interviews")
    public List<InterviewResponse> getInterviews(
            @PathVariable Long applicationId,
            Authentication authentication) {

        return interviewService
                .getInterviewsByApplication(
                        applicationId,
                        authentication.getName()
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @PutMapping("/{applicationId}/interviews/{interviewId}")
    public InterviewResponse updateInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            Authentication authentication,
            @RequestBody Interview updatedInterview) {

        Interview interview =
                interviewService.updateInterview(
                        applicationId,
                        interviewId,
                        authentication.getName(),
                        updatedInterview
                );

        return convertToResponse(interview);
    }

    @DeleteMapping("/{applicationId}/interviews/{interviewId}")
    public void deleteInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            Authentication authentication) {

        interviewService.deleteInterview(
                applicationId,
                interviewId,
                authentication.getName()
        );
    }

    private InterviewResponse convertToResponse(
            Interview interview) {

        return new InterviewResponse(
                interview.getId(),
                interview.getRoundName(),
                interview.getScheduledAt(),
                interview.getMode(),
                interview.getMeetingLink(),
                interview.getNotes(),
                interview.getStatus()
        );
    }
}
