package com.applytrack.controller;

import com.applytrack.dto.ApplicationEventResponse;
import com.applytrack.entity.ApplicationEvent;
import com.applytrack.service.ApplicationEventService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationEventController {

    private final ApplicationEventService eventService;

    public ApplicationEventController(
            ApplicationEventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/{applicationId}/events")
    public ApplicationEventResponse createEvent(
            @PathVariable Long applicationId,
            Authentication authentication,
            @RequestBody ApplicationEvent event) {

        String email = authentication.getName();

        ApplicationEvent savedEvent =
                eventService.createEvent(
                        applicationId,
                        email,
                        event
                );

        return convertToResponse(savedEvent);
    }

    @GetMapping("/{applicationId}/events")
    public List<ApplicationEventResponse> getEvents(
            @PathVariable Long applicationId,
            Authentication authentication) {

        String email = authentication.getName();

        return eventService
                .getEventsByApplication(applicationId, email)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private ApplicationEventResponse convertToResponse(
            ApplicationEvent event) {

        return new ApplicationEventResponse(
                event.getId(),
                event.getEventType(),
                event.getDescription(),
                event.getEventDate(),
                event.getCreatedAt()
        );
    }
}