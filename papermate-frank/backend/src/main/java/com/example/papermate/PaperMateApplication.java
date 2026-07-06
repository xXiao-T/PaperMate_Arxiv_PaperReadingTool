package com.example.papermate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PaperMateApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaperMateApplication.class, args);
    }
}