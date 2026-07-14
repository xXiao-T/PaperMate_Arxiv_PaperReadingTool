package com.papermate.paper.specification;

import com.papermate.paper.entity.Paper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PaperSpecification {

    public static Specification<Paper> searchBy(String keyword, String tag) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim() + "%";
                Predicate titleLike = cb.like(root.get("title"), pattern);
                Predicate authorsLike = cb.like(root.get("authors"), pattern);
                Predicate abstractLike = cb.like(root.get("paperAbstract"), pattern);
                predicates.add(cb.or(titleLike, authorsLike, abstractLike));
            }

            if (tag != null && !tag.isBlank()) {
                String tagPattern = "%" + tag.trim() + "%";
                predicates.add(cb.like(root.get("tags"), tagPattern));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
