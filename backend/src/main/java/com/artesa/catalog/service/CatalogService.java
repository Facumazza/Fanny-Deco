package com.artesa.catalog.service;

import com.artesa.catalog.domain.Category;
import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductBadge;
import com.artesa.catalog.domain.Review;
import com.artesa.catalog.repository.CategoryRepository;
import com.artesa.catalog.repository.ProductRepository;
import com.artesa.catalog.repository.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;
    private final ReviewRepository reviewRepo;

    public CatalogService(CategoryRepository categoryRepo,
                          ProductRepository productRepo,
                          ReviewRepository reviewRepo) {
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
        this.reviewRepo = reviewRepo;
    }

    public List<Category> listCategories() {
        return categoryRepo.findAllByOrderByDisplayOrderAscNameAsc();
    }

    public Page<Product> searchProducts(String categorySlug,
                                        ProductBadge badge,
                                        String q,
                                        Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (categorySlug != null && !categorySlug.isBlank()) {
                preds.add(cb.equal(root.get("category").get("slug"), categorySlug));
            }
            if (badge != null) {
                preds.add(cb.equal(root.get("badge"), badge));
            }
            if (q != null && !q.isBlank()) {
                // Match "maimara" → "Maimará" by folding accents on both sides
                // via Postgres' unaccent(). LIKE stays lowercase for case
                // insensitivity. The V12 migration enables the unaccent
                // extension in production; tests running against H2 skip
                // this path via the specification only being exercised in
                // integration tests that also spin up Postgres.
                var normalizedName = cb.lower(
                    cb.function("unaccent", String.class, root.get("name"))
                );
                preds.add(cb.like(normalizedName,
                                  "%" + stripAccents(q).toLowerCase() + "%"));
            }
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(new Predicate[0]));
        };
        return productRepo.findAll(spec, pageable);
    }

    public Product getProduct(String slug) {
        return productRepo.findBySlug(slug)
                          .orElseThrow(() -> new ProductNotFoundException(slug));
    }

    public List<Review> latestReviews(int limit) {
        int clamped = Math.max(1, Math.min(20, limit));
        return reviewRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, clamped));
    }

    /**
     * Fold accented characters to their ASCII equivalents on the query side.
     * Postgres' unaccent() does the same on the stored side, so the LIKE
     * matches regardless of whether the customer typed "café" or "cafe".
     */
    private static String stripAccents(String s) {
        return Normalizer.normalize(s, Normalizer.Form.NFD)
                         .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }
}
