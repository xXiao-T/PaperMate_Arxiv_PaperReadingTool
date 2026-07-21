package com.papermate.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class KnowledgeGraphVO {
    private final List<Node> nodes;
    private final List<Edge> edges;

    @Getter
    @AllArgsConstructor
    public static class Node {
        private final String id;
        private final String label;
        private final String desc;
        private final long value;

        public Node(String id, String label, long value) {
            this(id, label, null, value);
        }
    }

    @Getter
    @AllArgsConstructor
    public static class Edge {
        private final String source;
        private final String target;
        private final String label;
        private final long value;

        public Edge(String source, String target, long value) {
            this(source, target, null, value);
        }
    }
}
