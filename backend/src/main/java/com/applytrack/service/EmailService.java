package com.applytrack.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
            String recipient,
            String resetLink
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipient);
        message.setSubject("ApplyTrack - Password Reset");

        message.setText(
                "Hello,\n\n" +
                "We received a request to reset your ApplyTrack password.\n\n" +
                "Click the link below to create a new password:\n\n" +
                resetLink + "\n\n" +
                "This password reset link will expire in 15 minutes.\n\n" +
                "If you did not request a password reset, you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "ApplyTrack Team"
        );

        mailSender.send(message);
    }
}