package com.applytrack.controller;

import com.applytrack.dto.ResumeMatchingResponse;
import com.applytrack.service.ResumeMatchingService;
import com.applytrack.service.ResumeParserService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeMatchingController {

    private final ResumeParserService resumeParserService;
    private final ResumeMatchingService resumeMatchingService;

    public ResumeMatchingController(
            ResumeParserService resumeParserService,
            ResumeMatchingService resumeMatchingService
    ) {
        this.resumeParserService = resumeParserService;
        this.resumeMatchingService = resumeMatchingService;
    }

    @PostMapping(
            value = "/match",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResumeMatchingResponse matchResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription
    ) {

        String resumeText =
                resumeParserService.extractText(file);

        ResumeMatchingService.MatchingResult result =
                resumeMatchingService.matchResumeWithJobDescription(
                        resumeText,
                        jobDescription
                );

        return new ResumeMatchingResponse(
                result.matchPercentage(),
                result.matchedSkills(),
                result.missingSkills(),
                result.recommendation()
        );
    }
}
