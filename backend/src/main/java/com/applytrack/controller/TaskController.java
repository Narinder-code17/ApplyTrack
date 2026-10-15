package com.applytrack.controller;

import com.applytrack.dto.TaskResponse;
import com.applytrack.entity.Task;
import com.applytrack.service.TaskService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskResponse createTask(
            @RequestParam(required = false) Long applicationId,
            Authentication authentication,
            @RequestBody Task task) {

        Task savedTask = taskService.createTask(
                authentication.getName(),
                applicationId,
                task
        );

        return convertToResponse(savedTask);
    }

    @GetMapping
    public List<TaskResponse> getTasks(
            Authentication authentication) {

        return taskService.getTasks(authentication.getName())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @PatchMapping("/{taskId}/toggle")
    public TaskResponse toggleTask(
            @PathVariable Long taskId,
            Authentication authentication) {

        Task updatedTask = taskService.toggleTask(
                taskId,
                authentication.getName()
        );

        return convertToResponse(updatedTask);
    }

    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long taskId,
            @RequestParam(required = false) String applicationId,
            Authentication authentication,
            @RequestBody Task task) {

        Task updatedTask = taskService.updateTask(
                taskId,
                authentication.getName(),
                task,
                applicationId
        );

        return convertToResponse(updatedTask);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(
            @PathVariable Long taskId,
            Authentication authentication) {

        taskService.deleteTask(
                taskId,
                authentication.getName()
        );
    }

    private TaskResponse convertToResponse(Task task) {

        Long applicationId = task.getApplication() != null
                ? task.getApplication().getId()
                : null;

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.isCompleted(),
                applicationId,
                task.getPriority()
        );
    }
}