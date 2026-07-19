package com.papermate.note.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "paper_annotations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Annotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "paper_id", nullable = false)
    private Long paperId;

    @Column(name = "page_index", nullable = false)
    private Integer pageIndex;

    @Column(name = "start_offset", nullable = false)
    private Integer startOffset;

    @Column(name = "end_offset", nullable = false)
    private Integer endOffset;

    @Column(name = "pdf_x")
    private Double pdfX;

    @Column(name = "pdf_y")
    private Double pdfY;

    @Column(name = "pdf_width")
    private Double pdfWidth;

    @Column(name = "pdf_height")
    private Double pdfHeight;

    @Column(name = "selected_text", columnDefinition = "TEXT")
    private String selectedText;

    @Column(name = "comment_text", columnDefinition = "TEXT")
    private String commentText;

    @Builder.Default
    @Column(name = "annotation_type", nullable = false, length = 20)
    private String annotationType = "note";

    @Builder.Default
    @Column(name = "color", nullable = false, length = 20)
    private String color = "#FFD700";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (annotationType == null || annotationType.isBlank()) {
            annotationType = "note";
        }
        if (color == null || color.isBlank()) {
            color = "#FFD700";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
