package com.papermate.tag.dto;

public class TagDTO {

    private Long id;
    private String name;
    private String color;
    private Long paperCount;

    public TagDTO() {}

    public TagDTO(Long id, String name, String color, Long paperCount) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.paperCount = paperCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Long getPaperCount() { return paperCount; }
    public void setPaperCount(Long paperCount) { this.paperCount = paperCount; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String color;
        private Long paperCount;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public Builder paperCount(Long paperCount) { this.paperCount = paperCount; return this; }
        public TagDTO build() { return new TagDTO(id, name, color, paperCount); }
    }
}
