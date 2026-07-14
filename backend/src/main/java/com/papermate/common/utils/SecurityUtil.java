package com.papermate.common.utils;

import com.papermate.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Utility to access the currently authenticated user from the security context.
 * <p>
 * JwtAuthFilter stores the User entity directly as the principal in
 * UsernamePasswordAuthenticationToken, so it can be retrieved from
 * SecurityContextHolder anywhere in the application.
 */
@Component
public class SecurityUtil {

    /**
     * Get the currently authenticated user, if any.
     *
     * @return Optional containing the current user, or empty if not authenticated
     */
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return Optional.of(user);
        }

        return Optional.empty();
    }

    /**
     * Get the current user ID, or throw if not authenticated.
     *
     * @return the current user's ID
     * @throws IllegalStateException if no user is authenticated
     */
    public Long getCurrentUserId() {
        return getCurrentUser()
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
    }
}
