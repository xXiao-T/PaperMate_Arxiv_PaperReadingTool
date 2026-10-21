package com.papermate.auth.controller;

import com.papermate.auth.dto.LoginRequest;
import com.papermate.auth.dto.LoginVO;
import com.papermate.auth.dto.RegisterRequest;
import com.papermate.auth.entity.User;
import com.papermate.auth.service.AuthService;
import com.papermate.auth.repository.UserRepository;
import com.papermate.auth.service.ResetCodeService;
import com.papermate.common.Result;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final ResetCodeService resetCodeService;

    // 构造函数注入依赖
    public AuthController(AuthService authService, 
                          UserRepository userRepository, 
                          ResetCodeService resetCodeService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.resetCodeService = resetCodeService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Result<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return Result.success(Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
        ));
    }

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        LoginVO vo = authService.login(request);
        return Result.success(vo);
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me() {
        User user = authService.getCurrentUser();
        return Result.success(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "role", user.getRole(),
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        ));
    }

    @PostMapping("/send-reset-code")
    public Result<Void> sendResetCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return Result.badRequest("邮箱不能为空");
        }
        
        // 校验邮箱是否注册
        if (!userRepository.existsByEmail(email)) {
            return Result.badRequest("该邮箱未在系统中注册");
        }
        
        try {
            resetCodeService.generateAndSendCode(email);
            return Result.success();
        } catch (Exception e) {
            return Result.internalError("邮件发送失败，请检查配置或稍后再试");
        }
    }

    @PostMapping("/verify-reset-code")
    public Result<Void> verifyResetCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            return Result.badRequest("邮箱和验证码不能为空");
        }

        // 调用 ResetCodeService 里的 verifyCode 方法进行比对
        if (resetCodeService.verifyCode(email, code)) {
            return Result.success();
        } else {
            return Result.badRequest("验证码错误或已过期");
        }
    }

    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("newPassword");
        
        if (email == null || code == null || newPassword == null) {
            return Result.badRequest("参数不完整");
        }
        
        try {
            authService.resetPassword(email, code, newPassword);
            return Result.success();
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        } catch (Exception e) {
            return Result.internalError("重置密码失败，请稍后再试");
        }
    }
}