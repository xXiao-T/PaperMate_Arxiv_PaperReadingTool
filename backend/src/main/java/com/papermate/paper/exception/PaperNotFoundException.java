package com.papermate.paper.exception;

public class PaperNotFoundException extends RuntimeException {
    public PaperNotFoundException(Long paperId) {
        super("Paper not found: " + paperId);
    }
}
