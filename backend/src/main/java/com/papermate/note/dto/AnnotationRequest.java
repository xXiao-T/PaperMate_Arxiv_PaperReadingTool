package com.papermate.note.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnotationRequest {
    @PositiveOrZero(message = "Page index must not be negative")
    private Integer pageIndex;

    @PositiveOrZero(message = "Start offset must not be negative")
    private Integer startOffset;

    @PositiveOrZero(message = "End offset must not be negative")
    private Integer endOffset;

    @DecimalMin(value = "0.0", message = "PDF X must be at least 0")
    @DecimalMax(value = "100.0", message = "PDF X must not exceed 100")
    private Double pdfX;

    @DecimalMin(value = "0.0", message = "PDF Y must be at least 0")
    @DecimalMax(value = "100.0", message = "PDF Y must not exceed 100")
    private Double pdfY;

    @DecimalMin(value = "0.0", message = "PDF width must be at least 0")
    @DecimalMax(value = "100.0", message = "PDF width must not exceed 100")
    private Double pdfWidth;

    @DecimalMin(value = "0.0", message = "PDF height must be at least 0")
    @DecimalMax(value = "100.0", message = "PDF height must not exceed 100")
    private Double pdfHeight;

    @Size(max = 20000, message = "Selected text is too long")
    private String selectedText;

    @Size(max = 20000, message = "Comment text is too long")
    private String commentText;

    @Pattern(
        regexp = "(?i)highlight|underline|comment|note",
        message = "Unsupported annotation type"
    )
    private String annotationType;

    @Pattern(
        regexp = "^#[0-9A-Fa-f]{6}$",
        message = "Color must use #RRGGBB format"
    )
    private String color;
}
