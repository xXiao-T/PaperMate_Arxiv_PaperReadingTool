package com.papermate.auth.dto;

import java.time.LocalDateTime;

public class LoginVO {

    private String token;
    private UserInfo user;

    public LoginVO() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private UserInfo user;
        public Builder token(String token) { this.token = token; return this; }
        public Builder user(UserInfo user) { this.user = user; return this; }
        public LoginVO build() {
            LoginVO vo = new LoginVO();
            vo.token = token;
            vo.user = user;
            return vo;
        }
    }

    // ─── Inner class: UserInfo ──────────────────────────────────────

    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String avatarUrl;
        private String role;
        private LocalDateTime createdAt;

        public UserInfo() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String username;
            private String email;
            private String avatarUrl;
            private String role;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder username(String username) { this.username = username; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
            public Builder role(String role) { this.role = role; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public UserInfo build() {
                UserInfo info = new UserInfo();
                info.id = id;
                info.username = username;
                info.email = email;
                info.avatarUrl = avatarUrl;
                info.role = role;
                info.createdAt = createdAt;
                return info;
            }
        }
    }
}
