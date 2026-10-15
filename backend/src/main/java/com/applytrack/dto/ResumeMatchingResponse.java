package com.applytrack.dto;

import java.util.List;

public record ResumeMatchingResponse(
        double matchPercentage,
        List<String> matchedSkills,
        List<String> missingSkills,
        String recommendation
) {
}
