package com.applytrack.service;

import com.applytrack.dto.DashboardResponse;
import com.applytrack.entity.ApplicationStatus;
import com.applytrack.entity.User;
import com.applytrack.repository.InterviewRepository;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public DashboardService(
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            UserRepository userRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        long totalApplications =
                jobApplicationRepository.countByUser(user);

        long saved =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.SAVED
                );

        long applied =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.APPLIED
                );

        long screening =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.SCREENING
                );

        long assessment =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.ASSESSMENT
                );

        long technicalInterview =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.TECHNICAL_INTERVIEW
                );

        long hrInterview =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.HR_INTERVIEW
                );

        long interviews =
                interviewRepository.countByApplication_User(user);

        long offers =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.OFFER
                );

        long rejected =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.REJECTED
                );

        long withdrawn =
                jobApplicationRepository.countByUserAndStatus(
                        user,
                        ApplicationStatus.WITHDRAWN
                );

        return new DashboardResponse(
                totalApplications,
                saved,
                applied,
                screening,
                assessment,
                technicalInterview,
                hrInterview,
                interviews,
                offers,
                rejected,
                withdrawn
        );
    }
}