package com.applytrack;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;

class PdfBoxResumeTest {

    @Test
    void extractResumeText() throws Exception {

        Path resumePath = Path.of(
                "C:\\Users\\narin\\OneDrive\\Desktop\\resume's\\Narinder Kumar (Resume).pdf"
        );

        byte[] pdfBytes = Files.readAllBytes(resumePath);

        try (var document = Loader.loadPDF(pdfBytes)) {

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            System.out.println("========== EXTRACTED RESUME TEXT ==========");
            System.out.println(text);
            System.out.println("===========================================");

            assertFalse(text.trim().isEmpty());
        }
    }
}
