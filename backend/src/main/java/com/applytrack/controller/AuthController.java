package com.applytrack.controller;

import com.applytrack.dto.ForgotPasswordRequest;
import com.applytrack.dto.LoginRequest;
import com.applytrack.dto.LoginResponse;
import com.applytrack.dto.RegisterRequest;
import com.applytrack.dto.ResetPasswordRequest;
import com.applytrack.dto.UserResponse;
import com.applytrack.entity.User;
import com.applytrack.service.AuthenticationService;
import com.applytrack.service.PasswordResetService;
import com.applytrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationService authenticationService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            UserService userService,
            AuthenticationService authenticationService,
            PasswordResetService passwordResetService) {

        this.userService = userService;
        this.authenticationService = authenticationService;
        this.passwordResetService = passwordResetService;
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request) {

        User savedUser = userService.registerUser(request);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authenticationService.login(request);
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    @PostMapping("/forgot-password")
    public String forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.requestPasswordReset(
                request.getEmail()
        );

        return "If an account exists with this email, a password reset link has been sent.";
    }

    // =========================
    // RESET PASSWORD
    // =========================
    @PostMapping("/reset-password")
    public String resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return "Password reset successfully. You can now login.";
    }
}
