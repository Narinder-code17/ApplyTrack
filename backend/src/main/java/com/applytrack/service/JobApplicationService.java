package com.applytrack.service;

import com.applytrack.entity.ApplicationEvent;
import com.applytrack.entity.ApplicationStatus;
import com.applytrack.entity.Company;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import com.applytrack.repository.ApplicationEventRepository;
import com.applytrack.repository.CompanyRepository;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationEventRepository eventRepository;

    public JobApplicationService(
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository,
            ApplicationEventRepository eventRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.eventRepository = eventRepository;
    }

    public JobApplication createApplication(
            Long userId,
            Long companyId,
            JobApplication application
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new RuntimeException("Company not found")
                );

        application.setUser(user);
        application.setCompany(company);

        // Automatically set today's date when the application is created
        application.setAppliedAt(LocalDate.now());

        JobApplication savedApplication =
                jobApplicationRepository.save(application);

        // Create initial timeline event
        ApplicationEvent event = new ApplicationEvent();

        event.setApplication(savedApplication);
        event.setEventType("APPLICATION_CREATED");
        event.setDescription(
                "Application created with status "
                        + savedApplication.getStatus()
        );

        eventRepository.save(event);

        return savedApplication;
    }

    public List<JobApplication> getApplicationsByUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return jobApplicationRepository.findByUser(user);
    }

    public JobApplication updateStatus(
            Long applicationId,
            String email,
            ApplicationStatus newStatus
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        JobApplication application =
                jobApplicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found")
                        );

        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not authorized to update this application"
            );
        }

        ApplicationStatus oldStatus = application.getStatus();

        application.setStatus(newStatus);

        JobApplication savedApplication =
                jobApplicationRepository.save(application);

        // Create timeline event whenever status changes
        ApplicationEvent event = new ApplicationEvent();

        event.setApplication(savedApplication);
        event.setEventType("STATUS_CHANGED");
        event.setDescription(
                "Application status changed from "
                        + oldStatus
                        + " to "
                        + newStatus
        );

        eventRepository.save(event);

        return savedApplication;
    }
}