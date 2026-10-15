package com.applytrack.repository;

import com.applytrack.entity.Interview;
import com.applytrack.entity.JobApplication;
import com.applytrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationOrderByScheduledAtAsc(
            JobApplication application
    );

    long countByApplication_User(User user);

    List<Interview> findByApplication_UserOrderByScheduledAtAsc(
            User user
    );
}