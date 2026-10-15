package com.applytrack.controller;

import com.applytrack.service.ResumeParserService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeParserController {

    private final ResumeParserService resumeParserService;

    public ResumeParserController(
            ResumeParserService resumeParserService
    ) {
        this.resumeParserService = resumeParserService;
    }

    @PostMapping(
            value = "/parse",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String parseResume(
            @RequestParam("file") MultipartFile file
    ) {

        return resumeParserService.extractText(file);
    }
}