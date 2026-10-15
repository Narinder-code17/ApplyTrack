package com.applytrack.repository;

import com.applytrack.entity.Task;
import com.applytrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository
        extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByDueDateAsc(User user);
}