
package com.applytrack.service;

import com.applytrack.entity.ApplicationEvent;
import com.applytrack.entity.Interview;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import com.applytrack.repository.ApplicationEventRepository;
import com.applytrack.repository.InterviewRepository;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InterviewService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final ApplicationEventRepository applicationEventRepository;

    public InterviewService(
            InterviewRepository interviewRepository,
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository,
            ApplicationEventRepository applicationEventRepository) {

        this.interviewRepository = interviewRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.applicationEventRepository = applicationEventRepository;
    }

    public Interview createInterview(
            Long applicationId,
            String email,
            Interview interview) {

        JobApplication application =
                getUserApplication(applicationId, email);

        interview.setApplication(application);

        Interview savedInterview =
                interviewRepository.save(interview);

        ApplicationEvent event = new ApplicationEvent();
        event.setApplication(application);
        event.setEventType("INTERVIEW_SCHEDULED");

        String scheduledDate = formatDate(savedInterview);

        event.setDescription(
                savedInterview.getRoundName()
                        + " scheduled for "
                        + scheduledDate
        );

        applicationEventRepository.save(event);

        return savedInterview;
    }

    public List<Interview> getInterviewsByApplication(
            Long applicationId,
            String email) {

        JobApplication application =
                getUserApplication(applicationId, email);

        return interviewRepository
                .findByApplicationOrderByScheduledAtAsc(application);
    }

    public Interview updateInterview(
            Long applicationId,
            Long interviewId,
            String email,
            Interview updatedInterview) {

        JobApplication application =
                getUserApplication(applicationId, email);

        Interview existingInterview =
                interviewRepository.findById(interviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interview not found"));

        if (!existingInterview.getApplication().getId()
                .equals(application.getId())) {

            throw new RuntimeException(
                    "You are not authorized to update this interview");
        }

        existingInterview.setRoundName(
                updatedInterview.getRoundName());

        existingInterview.setScheduledAt(
                updatedInterview.getScheduledAt());

        existingInterview.setMode(
                updatedInterview.getMode());

        existingInterview.setMeetingLink(
                updatedInterview.getMeetingLink());

        existingInterview.setNotes(
                updatedInterview.getNotes());

        existingInterview.setStatus(
                updatedInterview.getStatus());

        Interview savedInterview =
                interviewRepository.save(existingInterview);

        ApplicationEvent event = new ApplicationEvent();
        event.setApplication(application);
        event.setEventType("INTERVIEW_UPDATED");
        event.setDescription(
                savedInterview.getRoundName()
                        + " updated — Status: "
                        + savedInterview.getStatus()
                        + ", Date: "
                        + formatDate(savedInterview)
        );

        applicationEventRepository.save(event);

        return savedInterview;
    }

    @Transactional
    public void deleteInterview(
            Long applicationId,
            Long interviewId,
            String email) {

        JobApplication application =
                getUserApplication(applicationId, email);

        Interview interview =
                interviewRepository.findById(interviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interview not found"));

        if (!interview.getApplication().getId()
                .equals(application.getId())) {

            throw new RuntimeException(
                    "You are not authorized to delete this interview");
        }

        String roundName = interview.getRoundName();
        String status = interview.getStatus();

        ApplicationEvent event = new ApplicationEvent();
        event.setApplication(application);
        event.setEventType("INTERVIEW_DELETED");
        event.setDescription(
                roundName
                        + " deleted (previous status: "
                        + status
                        + ")"
        );

        applicationEventRepository.save(event);

        interviewRepository.delete(interview);
    }

    private String formatDate(Interview interview) {
        if (interview.getScheduledAt() == null) {
            return "No date scheduled";
        }

        return interview.getScheduledAt().format(DATE_FORMATTER);
    }

    private JobApplication getUserApplication(
            Long applicationId,
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        JobApplication application =
                jobApplicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found"));

        if (!application.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this application");
        }

        return application;
    }
}
