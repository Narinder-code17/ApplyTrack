package com.applytrack.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ResumeMatchingService {

    private final SkillExtractionService skillExtractionService;

    public ResumeMatchingService(
            SkillExtractionService skillExtractionService
    ) {
        this.skillExtractionService = skillExtractionService;
    }

    public MatchingResult matchResumeWithJobDescription(
            String resumeText,
            String jobDescription
    ) {

        if (resumeText == null || resumeText.isBlank()) {
            throw new IllegalArgumentException(
                    "Resume text cannot be empty"
            );
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            throw new IllegalArgumentException(
                    "Job description cannot be empty"
            );
        }

        // Extract skills from both sources.
        List<String> extractedResumeSkills =
                skillExtractionService.extractSkills(resumeText);

        List<String> extractedJobSkills =
                skillExtractionService.extractSkills(jobDescription);

        // Keep the first occurrence of each normalized skill.
        Map<String, String> resumeSkillMap =
                createNormalizedSkillMap(extractedResumeSkills);

        Map<String, String> jobSkillMap =
                createNormalizedSkillMap(extractedJobSkills);

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (Map.Entry<String, String> entry :
                jobSkillMap.entrySet()) {

            String normalizedSkill = entry.getKey();
            String displaySkill = entry.getValue();

            if (resumeSkillMap.containsKey(normalizedSkill)) {
                matchedSkills.add(displaySkill);
            } else {
                missingSkills.add(displaySkill);
            }
        }

        double matchPercentage = 0.0;

        if (!jobSkillMap.isEmpty()) {
            matchPercentage =
                    matchedSkills.size() * 100.0
                            / jobSkillMap.size();
        }

        matchPercentage =
                Math.round(matchPercentage * 100.0) / 100.0;

        String recommendation = generateRecommendation(
                matchPercentage,
                missingSkills
        );

        return new MatchingResult(
                matchPercentage,
                matchedSkills,
                missingSkills,
                recommendation
        );
    }

    private Map<String, String> createNormalizedSkillMap(
            List<String> skills
    ) {

        Map<String, String> skillMap = new LinkedHashMap<>();

        for (String skill : skills) {
            if (skill == null || skill.isBlank()) {
                continue;
            }

            String normalized = normalizeSkill(skill);

            skillMap.putIfAbsent(normalized, skill);
        }

        return skillMap;
    }

    private String normalizeSkill(String skill) {

        String normalized = skill
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("\\s+", " ");

        // Treat common REST API variations as equivalent.
        if (normalized.equals("rest api")
                || normalized.equals("rest apis")) {
            return "rest apis";
        }

        // Treat these as one canonical testing skill.
        if (normalized.equals("unit tests")
                || normalized.equals("automated unit tests")
                || normalized.equals("automated testing")
                || normalized.equals("software testing")
                || normalized.equals("junit")) {
            return "unit testing";
        }

        // Treat common aliases consistently.
        if (normalized.equals("apache kafka")) {
            return "kafka";
        }

        if (normalized.equals("express.js")) {
            return "express";
        }

        if (normalized.equals("object-oriented programming")) {
            return "oop";
        }

        if (normalized.equals("infrastructure as code")) {
            return "iac";
        }

        return normalized;
    }

    private String generateRecommendation(
            double matchPercentage,
            List<String> missingSkills
    ) {

        if (matchPercentage >= 80) {
            return "Strong match. You can confidently apply for this role.";
        }

        if (matchPercentage >= 60) {
            return "Good match. Focus on "
                    + String.join(", ", missingSkills)
                    + " to improve your profile.";
        }

        if (matchPercentage >= 40) {
            return "Moderate match. Consider improving "
                    + String.join(", ", missingSkills)
                    + " before applying.";
        }

        return "Low match. Consider strengthening the required technical skills before applying.";
    }

    public record MatchingResult(
            double matchPercentage,
            List<String> matchedSkills,
            List<String> missingSkills,
            String recommendation
    ) {
    }
}
