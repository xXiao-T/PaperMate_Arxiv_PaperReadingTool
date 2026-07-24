package com.papermate.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ResetCodeService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    // 内存存储：Email -> [Code, ExpiryTime(ms)]
    private final Map<String, Object[]> codeCache = new ConcurrentHashMap<>();
    private static final long EXPIRY_TIME_MS = 5 * 60 * 1000; // 5分钟有效期

    public ResetCodeService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 生成并发送验证码
    public void generateAndSendCode(String email) {
        String code = generateRandomCode();
        long expiry = System.currentTimeMillis() + EXPIRY_TIME_MS;
        
        // 存入缓存
        codeCache.put(email, new Object[]{code, expiry});

        // 发送邮件
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("PaperMate - 重置密码验证码");
        message.setText("您的验证码是：" + code + "，该验证码在5分钟内有效。如果这不是您的操作，请忽略此邮件。");
        mailSender.send(message);
    }

    // 验证用户输入的验证码是否正确（为下一步“重置密码”预留）
    public boolean verifyCode(String email, String inputCode) {
        Object[] data = codeCache.get(email);
        if (data == null) return false;
        
        String realCode = (String) data[0];
        long expiry = (long) data[1];
        
        if (System.currentTimeMillis() > expiry) {
            codeCache.remove(email); // 已过期
            return false;
        }
        return realCode.equals(inputCode);
    }

    // 生成6位随机数
    private String generateRandomCode() {
        Random random = new Random();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    // 重置成功后消耗掉验证码
    public void removeCode(String email) {
        codeCache.remove(email);
    }
}