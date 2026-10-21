package com.papermate.auth.service;

import com.papermate.auth.dto.LoginRequest;
import com.papermate.auth.dto.LoginVO;
import com.papermate.auth.dto.RegisterRequest;
import com.papermate.auth.entity.User;

public interface AuthService {

    /**
     * Register a new user account.
     *
     * @param request registration form data
     * @return the newly created user
     * @throws IllegalArgumentException if validation fails
     */
    User register(RegisterRequest request);

    /**
     * Authenticate a user and return a JWT token.
     *
     * @param request login credentials
     * @return JWT token with user info
     * @throws IllegalArgumentException if credentials are invalid
     */
    LoginVO login(LoginRequest request);

    /**
     * Get the currently authenticated user.
     *
     * @return the current user entity
     */
    User getCurrentUser();

    /**
     * 重置密码
     */
    void resetPassword(String email, String code, String newPassword);
}
