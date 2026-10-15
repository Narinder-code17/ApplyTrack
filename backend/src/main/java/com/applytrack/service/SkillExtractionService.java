package com.applytrack.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class SkillExtractionService {

    private static final List<String> SKILLS = List.of(
            // Programming languages
            "Java", "Python", "JavaScript", "TypeScript",
            "C", "C++", "C#",

            // Backend development
            "Spring Boot", "Spring Framework", "Spring",
            "Hibernate", "JPA", "Microservices",
            "REST APIs", "REST API", "GraphQL",
            "System Design", "Distributed Systems",
            "API Design", "API Development",
            "Unit Testing", "Unit Tests",
            "Automated Testing", "Software Testing",
            "Integration Testing", "JUnit", "Mockito",
            "Maven", "Gradle",

            // Frontend development
            "React", "Angular", "Vue.js", "Node.js",
            "Express.js", "Express", "HTML", "CSS",
            "Tailwind CSS", "Next.js",

            // Databases and data
            "MongoDB", "MySQL", "SQL", "PostgreSQL",
            "Oracle", "SQL Server", "Redis",
            "Database Design", "Database Management",
            "Caching",

            // Cloud and infrastructure
            "AWS", "Azure", "EC2", "S3", "IAM",
            "Lambda", "CloudWatch", "Docker",
            "Kubernetes", "Terraform", "Ansible",
            "NGINX", "Linux", "Infrastructure as Code",
            "IaC",

            // CI/CD and monitoring
            "Jenkins", "GitHub Actions", "CI/CD",
            "Continuous Integration", "Continuous Deployment",
            "Prometheus", "Grafana", "Alertmanager",
            "Loki", "Jaeger", "ArgoCD", "GitOps",

            // Messaging and distributed technologies
            "Apache Kafka", "Kafka", "Message Queues",
            "RabbitMQ", "Apache Spark", "Hadoop",

            // Security and blockchain
            "Cybersecurity", "Authentication",
            "Authorization", "JWT", "OAuth",
            "Spring Security", "IPFS", "Solidity",
            "AES-256", "SHA-256", "Blockchain",

            // General software engineering
            "OOP", "Object-Oriented Programming",
            "DSA", "Data Structures", "Algorithms",
            "Problem Solving", "Agile", "Scrum",
            "Git", "GitHub", "Version Control",
            "Postman", "Debugging", "Code Review",
            "Performance Optimization", "Scalability",
            "Load Testing", "Design Patterns", "Clean Code",
            "Networking", "TCP/IP", "DNS", "HTTP", "HTTPS"
    );

    public List<String> extractSkills(String text) {

        if (text == null || text.isBlank()) {
            return List.of();
        }

        String normalizedText = text.toLowerCase(Locale.ROOT)
                .replace('\u2010', '-')
                .replace('\u2011', '-')
                .replace('\u2012', '-')
                .replace('\u2013', '-')
                .replace('\u2014', '-');

        Set<String> matchedSkills = new LinkedHashSet<>();

        for (String skill : SKILLS) {

            String normalizedSkill =
                    skill.toLowerCase(Locale.ROOT);

            Pattern pattern = Pattern.compile(
                    "(?<![a-z0-9+#])"
                            + Pattern.quote(normalizedSkill)
                            + "(?![a-z0-9+#])"
            );

            if (pattern.matcher(normalizedText).find()) {
                matchedSkills.add(skill);
            }
        }

        normalizeAliases(matchedSkills, normalizedText);

        return new ArrayList<>(matchedSkills);
    }

    private void normalizeAliases(
            Set<String> skills,
            String text
    ) {

        // REST API singular and plural variations
        if (Pattern.compile("\\brest\\s+apis?\\b")
                .matcher(text).find()) {
            skills.remove("REST API");
            skills.add("REST APIs");
        }

        // Spring Boot includes the Spring framework
        if (skills.contains("Spring Boot")) {
            skills.remove("Spring");
        }

        // Kafka aliases
        if (skills.contains("Apache Kafka")) {
            skills.remove("Kafka");
        }

        // Express aliases
        if (skills.contains("Express.js")) {
            skills.remove("Express");
        }

        // Unit testing aliases
        if (Pattern.compile(
                "\\b(unit\\s+testing|unit\\s+tests?|"
                        + "automated\\s+unit\\s+tests?|"
                        + "automated\\s+testing|"
                        + "software\\s+testing|junit)\\b"
        ).matcher(text).find()) {
            skills.add("Unit Testing");
        }

        skills.remove("Unit Tests");
        skills.remove("Automated Testing");
        skills.remove("Software Testing");
        skills.remove("JUnit");

        // Object-oriented programming aliases
        if (skills.contains("Object-Oriented Programming")) {
            skills.add("OOP");
            skills.remove("Object-Oriented Programming");
        }

        // Infrastructure as Code aliases
        if (skills.contains("Infrastructure as Code")) {
            skills.add("IaC");
            skills.remove("Infrastructure as Code");
        }
    }
}
