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
                preds.add(cb.like(cb.lower(root.get("name")),
                                  "%" + q.toLowerCase() + "%"));
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
}
