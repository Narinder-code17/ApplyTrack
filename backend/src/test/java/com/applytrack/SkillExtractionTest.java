package com.applytrack;

import com.applytrack.service.SkillExtractionService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class SkillExtractionTest {

    @Test
    void extractSkillsFromResumeText() {

        String resumeText = """
                NARINDER KUMAR

                PROFESSIONAL SUMMARY
                Computer Science undergraduate with full-stack development experience
                in Java, JavaScript, and OOP, including hands-on work with Spring Boot,
                Hibernate, React, Angular, and Node.js.

                TECHNICAL SKILLS
                Languages: Python, JavaScript, C, Java
                Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, Terraform,
                GitHub Actions, Linux
                Web & Backend: Node.js, Express, React, Angular, REST APIs,
                HTML, CSS, Spring Boot, Hibernate
                Databases: MongoDB, MySQL, SQL, PostgreSQL

                PROJECTS
                Blockchain, IPFS, Solidity, AES-256, SHA-256
                """;

        SkillExtractionService service =
                new SkillExtractionService();

        List<String> skills =
                service.extractSkills(resumeText);

        System.out.println("========== EXTRACTED SKILLS ==========");

        skills.forEach(skill ->
                System.out.println("? " + skill)
        );

        System.out.println("=======================================");

        assertTrue(skills.contains("Java"));
        assertTrue(skills.contains("Python"));
        assertTrue(skills.contains("Spring Boot"));
        assertTrue(skills.contains("React"));
        assertTrue(skills.contains("Docker"));
        assertTrue(skills.contains("Kubernetes"));
        assertTrue(skills.contains("PostgreSQL"));
        assertTrue(skills.contains("MongoDB"));
    }
}
