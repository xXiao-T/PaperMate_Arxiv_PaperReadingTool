package com.papermate.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LearningStatsVO {
    private final long weeklyReadingMinutes;
    private final long monthlyReadingMinutes;
    private final long totalReadingMinutes;
}
