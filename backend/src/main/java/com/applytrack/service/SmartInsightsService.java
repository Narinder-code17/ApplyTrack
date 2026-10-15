package com.applytrack.service;

import com.applytrack.dto.SmartInsightsResponse;
import com.applytrack.entity.ApplicationStatus;
import com.applytrack.entity.Assessment;
import com.applytrack.entity.Interview;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.Task;
import com.applytrack.entity.User;
import com.applytrack.repository.AssessmentRepository;
import com.applytrack.repository.InterviewRepository;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.TaskRepository;
import com.applytrack.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SmartInsightsService {

    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final AssessmentRepository assessmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public SmartInsightsService(
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            AssessmentRepository assessmentRepository,
            TaskRepository taskRepository,
            UserRepository userRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.assessmentRepository = assessmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public SmartInsightsResponse getInsights(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        List<JobApplication> applications =
                jobApplicationRepository.findByUser(user);

        if (applications.isEmpty()) {
            return new SmartInsightsResponse(
                    "LOW",
                    "No job applications found. Start by adding your first application."
            );
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        List<InsightCandidate> candidates = new ArrayList<>();

        // 1. Overdue follow-ups
        for (JobApplication application : applications) {

            if (application.getFollowUpDate() != null
                    && application.getFollowUpDate().isBefore(today)
                    && isActive(application.getStatus())) {

                candidates.add(new InsightCandidate(
                        application.getFollowUpDate().atStartOfDay(),
                        "HIGH",
                        "Your follow-up for the "
                                + application.getJobTitle()
                                + " application is overdue. Follow up with the company."
                ));
            }
        }

        // 2. Upcoming interviews
        List<Interview> interviews =
                interviewRepository
                        .findByApplication_UserOrderByScheduledAtAsc(user);

        for (Interview interview : interviews) {

            if (interview.getScheduledAt() == null) {
                continue;
            }

            String status = interview.getStatus();

            if (status != null
                    && (status.equalsIgnoreCase("CANCELLED")
                    || status.equalsIgnoreCase("COMPLETED"))) {
                continue;
            }

            LocalDateTime scheduledAt = interview.getScheduledAt();

            if (scheduledAt.isAfter(now)) {

                JobApplication application = interview.getApplication();

                String companyName =
                        application.getCompany() != null
                                ? application.getCompany().getName()
                                : "the company";

                String interviewDate =
                        scheduledAt.format(DATE_TIME_FORMATTER);

                candidates.add(new InsightCandidate(
                        scheduledAt,
                        "HIGH",
                        "Prepare for your upcoming "
                                + interview.getRoundName()
                                + " at "
                                + companyName
                                + " on "
                                + interviewDate
                                + "."
                ));
            }
        }

        // 3. Upcoming assessments
        List<Assessment> assessments =
                assessmentRepository
                        .findByApplication_UserOrderByDeadlineAsc(user);

        for (Assessment assessment : assessments) {

            if (assessment.getDeadline() == null) {
                continue;
            }

            String status = assessment.getStatus();

            if (status != null
                    && (status.equalsIgnoreCase("COMPLETED")
                    || status.equalsIgnoreCase("SUBMITTED"))) {
                continue;
            }

            LocalDateTime deadline = assessment.getDeadline();

            if (deadline.isAfter(now)) {

                candidates.add(new InsightCandidate(
                        deadline,
                        "HIGH",
                        "Complete your "
                                + assessment.getAssessmentName()
                                + " before "
                                + deadline.format(DATE_TIME_FORMATTER)
                                + "."
                ));
            }
        }

        // 4. Application deadlines within the next two days
        for (JobApplication application : applications) {

            LocalDate deadline = application.getDeadline();

            if (deadline != null
                    && !deadline.isBefore(today)
                    && !deadline.isAfter(today.plusDays(2))
                    && isActive(application.getStatus())) {

                candidates.add(new InsightCandidate(
                        deadline.atTime(LocalTime.MAX),
                        "HIGH",
                        "Your "
                                + application.getJobTitle()
                                + " application has a deadline on "
                                + deadline
                                + ". Complete the required action as soon as possible."
                ));
            }
        }

        // 5. Pending tasks due today or within the next three days
        List<Task> tasks =
                taskRepository.findByUserOrderByDueDateAsc(user);

        for (Task task : tasks) {

            if (task.isCompleted() || task.getDueDate() == null) {
                continue;
            }

            LocalDate dueDate = task.getDueDate();

            if (!dueDate.isBefore(today)
                    && !dueDate.isAfter(today.plusDays(3))) {

                String priority = normalizePriority(task.getPriority());

                candidates.add(new InsightCandidate(
                        dueDate.atTime(LocalTime.MAX),
                        priority,
                        "You have an upcoming task: "
                                + task.getTitle()
                                + ". It is due on "
                                + dueDate
                                + "."
                ));
            }
        }

        // 6. Select the earliest actionable item.
        // If deadlines are equal, HIGH priority wins over MEDIUM and LOW.
        if (!candidates.isEmpty()) {

            candidates.sort(
                    Comparator
                            .comparing((InsightCandidate candidate) ->
                                    candidate.dueAt)
                            .thenComparingInt(candidate ->
                                    priorityRank(candidate.priority))
            );

            InsightCandidate next = candidates.get(0);

            return new SmartInsightsResponse(
                    next.priority,
                    next.recommendation
            );
        }

        // 7. Fallback if no urgent event or task is found
        for (JobApplication application : applications) {

            if (application.getStatus() == ApplicationStatus.TECHNICAL_INTERVIEW
                    || application.getStatus() == ApplicationStatus.HR_INTERVIEW) {

                return new SmartInsightsResponse(
                        "HIGH",
                        "Prepare for your "
                                + application.getStatus()
                                .name()
                                .replace("_", " ")
                                .toLowerCase()
                                + " for "
                                + application.getJobTitle()
                                + "."
                );
            }
        }

        return new SmartInsightsResponse(
                "NORMAL",
                "Your applications are currently on track. "
                        + "Keep applying and follow up regularly."
        );
    }

    private boolean isActive(ApplicationStatus status) {

        return status != null
                && status != ApplicationStatus.REJECTED
                && status != ApplicationStatus.WITHDRAWN
                && status != ApplicationStatus.OFFER;
    }

    private String normalizePriority(String priority) {

        if (priority == null) {
            return "MEDIUM";
        }

        switch (priority.trim().toUpperCase()) {
            case "HIGH":
                return "HIGH";
            case "LOW":
                return "LOW";
            default:
                return "MEDIUM";
        }
    }

    private int priorityRank(String priority) {

        switch (priority) {
            case "HIGH":
                return 0;
            case "MEDIUM":
                return 1;
            default:
                return 2;
        }
    }

    private static class InsightCandidate {

        private final LocalDateTime dueAt;
        private final String priority;
        private final String recommendation;

        private InsightCandidate(
                LocalDateTime dueAt,
                String priority,
                String recommendation
        ) {
            this.dueAt = dueAt;
            this.priority = priority;
            this.recommendation = recommendation;
        }
    }
}
