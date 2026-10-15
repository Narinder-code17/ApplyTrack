package com.applytrack.repository;

import com.applytrack.entity.Assessment;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository
        extends JpaRepository<Assessment, Long> {

    List<Assessment> findByApplicationOrderByDeadlineAsc(
            JobApplication application
    );

    List<Assessment> findByApplication_UserOrderByDeadlineAsc(
            User user
    );
}