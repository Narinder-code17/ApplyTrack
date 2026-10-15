package com.applytrack.service;

import com.applytrack.entity.ApplicationEvent;
import com.applytrack.entity.Assessment;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import com.applytrack.repository.ApplicationEventRepository;
import com.applytrack.repository.AssessmentRepository;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final ApplicationEventRepository applicationEventRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository,
            ApplicationEventRepository applicationEventRepository) {

        this.assessmentRepository = assessmentRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.applicationEventRepository = applicationEventRepository;
    }

    public Assessment createAssessment(
            Long applicationId,
            String email,
            Assessment assessment) {

        JobApplication application =
                getUserApplication(applicationId, email);

        assessment.setApplication(application);

        Assessment savedAssessment =
                assessmentRepository.save(assessment);

        ApplicationEvent event = new ApplicationEvent();
        event.setApplication(application);
        event.setEventType("ASSESSMENT_ADDED");

        String deadline = "No deadline";

        if (savedAssessment.getDeadline() != null) {
            deadline = savedAssessment.getDeadline()
                    .format(DateTimeFormatter.ofPattern(
                            "dd MMM yyyy, hh:mm a"));
        }

        event.setDescription(
                savedAssessment.getAssessmentName()
                        + " assessment added with deadline "
                        + deadline
        );

        applicationEventRepository.save(event);

        return savedAssessment;
    }

    public List<Assessment> getAssessmentsByApplication(
            Long applicationId,
            String email) {

        JobApplication application =
                getUserApplication(applicationId, email);

        return assessmentRepository
                .findByApplicationOrderByDeadlineAsc(application);
    }

    public Assessment updateAssessment(
            Long applicationId,
            Long assessmentId,
            String email,
            Assessment updatedAssessment) {

        JobApplication application =
                getUserApplication(applicationId, email);

        Assessment existingAssessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found"));

        if (!existingAssessment.getApplication().getId()
                .equals(application.getId())) {

            throw new RuntimeException(
                    "You are not authorized to update this assessment");
        }

        existingAssessment.setAssessmentName(
                updatedAssessment.getAssessmentName());

        existingAssessment.setType(
                updatedAssessment.getType());

        existingAssessment.setDeadline(
                updatedAssessment.getDeadline());

        existingAssessment.setStatus(
                updatedAssessment.getStatus());

        existingAssessment.setScore(
                updatedAssessment.getScore());

        existingAssessment.setAssessmentLink(
                updatedAssessment.getAssessmentLink());

        existingAssessment.setNotes(
                updatedAssessment.getNotes());

        Assessment savedAssessment =
                assessmentRepository.save(existingAssessment);

        ApplicationEvent event = new ApplicationEvent();
        event.setApplication(application);
        event.setEventType("ASSESSMENT_UPDATED");

        String deadline = "No deadline";

        if (savedAssessment.getDeadline() != null) {
            deadline = savedAssessment.getDeadline()
                    .format(DateTimeFormatter.ofPattern(
                            "dd MMM yyyy, hh:mm a"));
        }

        event.setDescription(
                savedAssessment.getAssessmentName()
                        + " assessment updated"
                        + " — Status: "
                        + savedAssessment.getStatus()
                        + ", Deadline: "
                        + deadline
        );

        applicationEventRepository.save(event);

        return savedAssessment;
    }

    @Transactional
    public void deleteAssessment(
            Long applicationId,
            Long assessmentId,
            String email) {

        JobApplication application =
                getUserApplication(applicationId, email);

        Assessment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found"));

        if (!assessment.getApplication().getId()
                .equals(application.getId())) {

            throw new RuntimeException(
                    "You are not authorized to delete this assessment");
        }

        // Capture details before deleting the assessment.
        String assessmentName = assessment.getAssessmentName();
        String status = assessment.getStatus();

        // Record the deletion in the application timeline.
        ApplicationEvent event = new ApplicationEvent();
        event.setApplication(application);
        event.setEventType("ASSESSMENT_DELETED");
        event.setDescription(
                assessmentName
                        + " assessment deleted (previous status: "
                        + status
                        + ")"
        );

        applicationEventRepository.save(event);

        // Delete only after validating ownership.
        assessmentRepository.delete(assessment);
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