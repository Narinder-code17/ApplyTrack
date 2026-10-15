package com.applytrack.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeParserService {

    public String extractText(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file is empty");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Only PDF resume files are supported"
            );
        }

        try {
            byte[] fileBytes = file.getBytes();

            try (var document = Loader.loadPDF(fileBytes)) {

                PDFTextStripper pdfTextStripper =
                        new PDFTextStripper();

                String extractedText =
                        pdfTextStripper.getText(document);

                if (extractedText == null
                        || extractedText.trim().isEmpty()) {

                    throw new IllegalArgumentException(
                            "Could not extract text from the PDF"
                    );
                }

                return extractedText.trim();
            }

        } catch (IllegalArgumentException exception) {
            throw exception;

        } catch (Exception exception) {
            throw new RuntimeException(
                    "Failed to extract text from resume",
                    exception
            );
        }
    }
}