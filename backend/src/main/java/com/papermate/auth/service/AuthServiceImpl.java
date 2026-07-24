package com.papermate.auth.service;

import com.papermate.auth.dto.LoginRequest;
import com.papermate.auth.dto.LoginVO;
import com.papermate.auth.dto.RegisterRequest;
import com.papermate.auth.entity.User;
import com.papermate.auth.repository.UserRepository;
import com.papermate.config.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ResetCodeService resetCodeService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           ResetCodeService resetCodeService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.resetCodeService = resetCodeService;
    }

    @Override
    @Transactional
    public User register(RegisterRequest request) {
        // 1. Validate password confirmation
        if (!request.isPasswordMatch()) {
            throw new IllegalArgumentException("两次输入的密码不一致");
        }

        // 2. Check username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("该用户名已被占用，请更换");
        }

        // 3. Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("该邮箱已被注册，请直接登录");
        }

        // 4. Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .emailVerified(true) // Simplified: no email verification in MVP
                .role("user")
                .build();

        user = userRepository.save(user);
        log.info("New user registered: id={}, username={}", user.getId(), user.getUsername());
        return user;
    }

    @Override
    public LoginVO login(LoginRequest request) {
        String loginId = request.getUsername();  // 字段名保持 username，实际接受用户名或邮箱

        // 1. 按用户名或邮箱查找（含 @ 则视为邮箱）
        User user;
        if (loginId.contains("@")) {
            user = userRepository.findByEmail(loginId)
                    .orElseThrow(() -> new IllegalArgumentException("邮箱或密码错误"));
        } else {
            user = userRepository.findByUsername(loginId)
                    .orElseThrow(() -> new IllegalArgumentException("用户名或密码错误"));
        }

        // 2. Check account is active
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new IllegalArgumentException("账号已被禁用");
        }

        // 3. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // 4. Generate JWT token (subject = email, for consistency with JwtAuthFilter)
        String token = jwtUtil.generateToken(user.getEmail());

        // 5. Build response
        LoginVO.UserInfo userInfo = LoginVO.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();

        log.info("User logged in: id={}, username={}", user.getId(), user.getUsername());
        return LoginVO.builder()
                .token(token)
                .user(userInfo)
                .build();
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("用户未登录");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            // Reload from DB to get fresh data
            return userRepository.findById(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        }

        throw new IllegalArgumentException("无法获取当前用户信息");
    }

    @Override
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        // 1. 再次防线：校验验证码（防止有人跳过验证页面直接调用重置接口）
        if (!resetCodeService.verifyCode(email, code)) {
            throw new IllegalArgumentException("验证码错误或已失效");
        }
        
        // 2. 根据邮箱查找用户
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("该邮箱未注册"));
        
        // 3. 将新密码加密并保存
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // 4. 销毁验证码，保证一次性使用
        resetCodeService.removeCode(email);
    }
}
