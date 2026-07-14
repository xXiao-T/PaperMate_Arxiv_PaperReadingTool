package com.papermate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enable Spring's scheduled task support for the fetch module.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
