package com.applytrack.repository;

import com.applytrack.entity.ApplicationEvent;
import com.applytrack.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationEventRepository
        extends JpaRepository<ApplicationEvent, Long> {

    List<ApplicationEvent> findByApplicationOrderByEventDateAsc(
            JobApplication application
    );
}