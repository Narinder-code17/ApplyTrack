package com.applytrack;

import com.applytrack.service.ResumeMatchingService;
import com.applytrack.service.SkillExtractionService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResumeMatchingTest {

    @Test
    void matchResumeWithJobDescription() {

        String resumeText = """
                Narinder Kumar

                Technical Skills:
                Java, Python, JavaScript, Spring Boot, Hibernate,
                React, Angular, Node.js, Express, REST APIs,
                MongoDB, MySQL, SQL, PostgreSQL,
                AWS, Docker, Kubernetes, Jenkins, Terraform,
                GitHub Actions, Linux
                """;

        String jobDescription = """
                We are looking for a Backend Developer with experience in
                Java, Spring Boot, PostgreSQL, Docker, Redis and Kafka.
                Knowledge of REST APIs and Kubernetes is preferred.
                """;

        SkillExtractionService skillExtractionService =
                new SkillExtractionService();

        ResumeMatchingService matchingService =
                new ResumeMatchingService(skillExtractionService);

        ResumeMatchingService.MatchingResult result =
                matchingService.matchResumeWithJobDescription(
                        resumeText,
                        jobDescription
                );

        System.out.println("========== RESUME MATCHING RESULT ==========");

        System.out.println(
                "Match Percentage: "
                        + result.matchPercentage()
                        + "%"
        );

        System.out.println("Matched Skills:");
        result.matchedSkills().forEach(
                skill -> System.out.println("? " + skill)
        );

        System.out.println("Missing Skills:");
        result.missingSkills().forEach(
                skill -> System.out.println("? " + skill)
        );

        System.out.println(
                "Recommendation: "
                        + result.recommendation()
        );

        System.out.println(
                "============================================"
        );

        assertTrue(result.matchPercentage() > 0);

        assertTrue(
                result.matchedSkills().contains("Java")
        );

        assertTrue(
                result.matchedSkills().contains("Spring Boot")
        );

        assertTrue(
                result.matchedSkills().contains("PostgreSQL")
        );

        assertTrue(
                result.matchedSkills().contains("Docker")
        );

        assertTrue(
                result.matchedSkills().contains("Kubernetes")
        );

        assertTrue(
                result.missingSkills().contains("Redis")
        );

        assertTrue(
                result.missingSkills().contains("Kafka")
        );
    }
}
