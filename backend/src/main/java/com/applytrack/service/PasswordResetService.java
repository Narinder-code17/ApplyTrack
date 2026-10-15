package com.applytrack.service;

import com.applytrack.entity.PasswordResetToken;
import com.applytrack.entity.User;
import com.applytrack.repository.PasswordResetTokenRepository;
import com.applytrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void requestPasswordReset(String email) {

        userRepository.findByEmail(email).ifPresent(user -> {

            // Remove any previous reset token for this user.
            tokenRepository.deleteByUser(user);

            // Generate a random token for the email link.
            String token = UUID.randomUUID().toString();

            // Store only the SHA-256 hash in the database.
            PasswordResetToken resetToken =
                    new PasswordResetToken(
                            hashToken(token),
                            user,
                            LocalDateTime.now().plusMinutes(15)
                    );

            tokenRepository.save(resetToken);

            String resetLink =
                    frontendUrl.replaceAll("/+$", "")
                            + "/reset-password?token="
                            + token;

            // Send the original token, not its database hash.
            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    resetLink
            );
        });
    }

    @Transactional
    public void resetPassword(
            String token,
            String newPassword
    ) {

        PasswordResetToken resetToken =
                tokenRepository.findByToken(hashToken(token))
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid or expired reset link"
                                )
                        );

        // Do not delete and throw in the same transaction:
        // the exception could roll back the deletion.
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Password reset link has expired"
            );
        }

        User user = resetToken.getUser();

        // Store the encoded password, never the raw password.
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        // The token can only be used once.
        tokenRepository.delete(resetToken);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable", e
            );
        }
    }
}
