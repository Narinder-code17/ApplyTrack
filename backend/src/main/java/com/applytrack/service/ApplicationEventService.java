package com.applytrack.service;

import com.applytrack.entity.ApplicationEvent;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import com.applytrack.repository.ApplicationEventRepository;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationEventService {

    private final ApplicationEventRepository eventRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    public ApplicationEventService(
            ApplicationEventRepository eventRepository,
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository) {

        this.eventRepository = eventRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
    }

    public ApplicationEvent createEvent(
            Long applicationId,
            String email,
            ApplicationEvent event) {

        JobApplication application =
                getUserApplication(applicationId, email);

        event.setApplication(application);

        return eventRepository.save(event);
    }

    public List<ApplicationEvent> getEventsByApplication(
            Long applicationId,
            String email) {

        JobApplication application =
                getUserApplication(applicationId, email);

        return eventRepository
                .findByApplicationOrderByEventDateAsc(application);
    }

    private JobApplication getUserApplication(
            Long applicationId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        JobApplication application =
                jobApplicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found"));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not authorized to access this application");
        }

        return application;
    }
}