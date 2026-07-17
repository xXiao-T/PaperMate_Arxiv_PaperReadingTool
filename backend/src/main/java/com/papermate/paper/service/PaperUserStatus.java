package com.papermate.paper.service;

public record PaperUserStatus(boolean favorited, boolean starred) {
    public static final PaperUserStatus NONE = new PaperUserStatus(false, false);
}
