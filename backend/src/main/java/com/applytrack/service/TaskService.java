package com.applytrack.service;

import com.applytrack.entity.JobApplication;
import com.applytrack.entity.Task;
import com.applytrack.entity.User;
import com.applytrack.repository.JobApplicationRepository;
import com.applytrack.repository.TaskRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository) {

        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public Task createTask(
            String email,
            Long applicationId,
            Task task) {

        User user = getUser(email);

        validateTitle(task.getTitle());

        task.setTitle(task.getTitle().trim());
        task.setUser(user);
        task.setCompleted(false);
        task.setPriority(normalizePriority(task.getPriority()));

        if (applicationId != null) {
            task.setApplication(getOwnedApplication(applicationId, user));
        } else {
            task.setApplication(null);
        }

        return taskRepository.save(task);
    }

    public List<Task> getTasks(String email) {
        User user = getUser(email);

        return taskRepository.findByUserOrderByDueDateAsc(user);
    }

    @Transactional
    public Task toggleTask(Long taskId, String email) {
        Task task = getOwnedTask(taskId, email);

        task.setCompleted(!task.isCompleted());

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(
            Long taskId,
            String email,
            Task updatedTask,
            String applicationId) {

        Task existingTask = getOwnedTask(taskId, email);

        validateTitle(updatedTask.getTitle());

        existingTask.setTitle(updatedTask.getTitle().trim());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setPriority(
                normalizePriority(updatedTask.getPriority())
        );

        // If applicationId is omitted, preserve the current link.
        // If it is empty, turn the task into a general task.
        // Otherwise, link it to an application owned by this user.
        if (applicationId != null) {
            if (applicationId.isBlank()) {
                existingTask.setApplication(null);
            } else {
                try {
                    Long id = Long.valueOf(applicationId);
                    existingTask.setApplication(
                            getOwnedApplication(id, existingTask.getUser())
                    );
                } catch (NumberFormatException exception) {
                    throw new IllegalArgumentException(
                            "Invalid application ID"
                    );
                }
            }
        }

        return taskRepository.save(existingTask);
    }

    @Transactional
    public void deleteTask(Long taskId, String email) {
        Task task = getOwnedTask(taskId, email);
        taskRepository.delete(task);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private Task getOwnedTask(Long taskId, String email) {
        User user = getUser(email);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not authorized to access this task"
            );
        }

        return task;
    }

    private JobApplication getOwnedApplication(
            Long applicationId,
            User user) {

        JobApplication application =
                jobApplicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                ));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not authorized to use this application"
            );
        }

        return application;
    }

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Task title is required"
            );
        }

        if (title.trim().length() > 255) {
            throw new IllegalArgumentException(
                    "Task title must not exceed 255 characters"
            );
        }
    }

    private String normalizePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return "MEDIUM";
        }

        String normalized = priority
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!List.of("HIGH", "MEDIUM", "LOW").contains(normalized)) {
            throw new IllegalArgumentException(
                    "Priority must be HIGH, MEDIUM, or LOW"
            );
        }

        return normalized;
    }
}