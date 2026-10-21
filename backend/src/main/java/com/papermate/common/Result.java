package com.papermate.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Unified API response format.
 * All controllers must use this class to wrap their return values.
 *
 * <p>Usage:
 * <pre>{@code
 *   return Result.success(data);
 *   return Result.error(400, "Bad request");
 * }</pre>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> {

    private int code;
    private String message;
    private T data;

    private Result() {}

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // ─── Static factory methods ───────────────────────────────────────

    /** 200 OK with data */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    /** 200 OK without data */
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }

    /** Error with custom code and message */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    // ─── Common error shortcuts ───────────────────────────────────────

    public static <T> Result<T> badRequest(String message) {
        return error(400, message);
    }

    public static <T> Result<T> unauthorized(String message) {
        return error(401, message);
    }

    public static <T> Result<T> forbidden(String message) {
        return error(403, message);
    }

    public static <T> Result<T> notFound(String message) {
        return error(404, message);
    }

    public static <T> Result<T> internalError(String message) {
        return error(500, message);
    }

    // ─── Getters ──────────────────────────────────────────────────────

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setData(T data) {
        this.data = data;
    }
}
