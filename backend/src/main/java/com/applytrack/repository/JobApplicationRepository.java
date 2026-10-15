package com.applytrack.repository;

import com.applytrack.entity.ApplicationStatus;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUser(User user);

    long countByUser(User user);

    long countByUserAndStatus(User user, ApplicationStatus status);
}