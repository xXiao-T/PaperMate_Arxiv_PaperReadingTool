package com.papermate.paper.specification;

import com.papermate.paper.entity.Paper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class PaperSpecification {
    private PaperSpecification() {
    }

    public static Specification<Paper> searchBy(String keyword, String tag) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("authors")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("paperAbstract")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("category")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("tags")), pattern)
                ));
            }

            if (tag != null && !tag.isBlank()) {
                String tagPattern = "%" + tag.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("tags")),
                    tagPattern
                ));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
