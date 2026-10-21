package com.papermate.tag.entity;

import com.papermate.paper.entity.Paper;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "paper_tags")
public class PaperTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    public PaperTag() {}

    public PaperTag(Long id, Paper paper, Tag tag) {
        this.id = id;
        this.paper = paper;
        this.tag = tag;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Paper getPaper() { return paper; }
    public void setPaper(Paper paper) { this.paper = paper; }

    public Tag getTag() { return tag; }
    public void setTag(Tag tag) { this.tag = tag; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Paper paper;
        private Tag tag;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder paper(Paper paper) { this.paper = paper; return this; }
        public Builder tag(Tag tag) { this.tag = tag; return this; }
        public PaperTag build() { return new PaperTag(id, paper, tag); }
    }
}
