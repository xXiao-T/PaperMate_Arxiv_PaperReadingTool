package com.papermate.common.utils;

/** arXiv API 全局速率限制器 —— 非阻塞，超频直接拒绝。 */
public class ArxivRateLimiter {

    private static volatile long lastRequestTime = 0;
    private static final long MIN_INTERVAL_MS = 3500;

    /** 如果距上次请求超过 MIN_INTERVAL_MS，记录时间并返回 true；否则返回 false（跳过本次） */
    public static synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        if (now - lastRequestTime < MIN_INTERVAL_MS) {
            return false;
        }
        lastRequestTime = now;
        return true;
    }
}
