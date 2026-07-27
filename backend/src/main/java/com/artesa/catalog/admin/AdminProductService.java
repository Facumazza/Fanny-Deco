package com.artesa.catalog.admin;

import com.artesa.catalog.admin.dto.ProductUpsertRequest;
import com.artesa.catalog.domain.Category;
import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductColor;
import com.artesa.catalog.repository.CategoryRepository;
import com.artesa.catalog.repository.ProductRepository;
import com.artesa.catalog.service.ProductNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Write-side counterpart to CatalogService. Used exclusively from admin endpoints.
 */
@Service
@Transactional
public class AdminProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    public AdminProductService(ProductRepository productRepo,
                               CategoryRepository categoryRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
    }

    @Transactional(readOnly = true)
    public Page<Product> listProducts(String q, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            return cb.or(
                cb.like(cb.lower(root.get("name")), "%" + q.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("slug")), "%" + q.toLowerCase() + "%")
            );
        };
        return productRepo.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Product getById(Long id) {
        return productRepo.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("id=" + id));
    }

    public Product create(ProductUpsertRequest req) {
        productRepo.findBySlug(req.slug()).ifPresent(existing -> {
            throw new SlugAlreadyExistsException(req.slug());
        });
        Category category = categoryRepo.findById(req.categoryId())
            .orElseThrow(() -> new CategoryNotFoundException(req.categoryId()));

        Product p = new Product();
        applyRequest(p, req, category);
        setField(p, "createdAt", Instant.now());
        return productRepo.save(p);
    }

    public Product update(Long id, ProductUpsertRequest req) {
        Product p = getById(id);

        // Slug uniqueness only matters when the new slug differs from the current one.
        if (!p.getSlug().equals(req.slug())) {
            productRepo.findBySlug(req.slug()).ifPresent(existing -> {
                throw new SlugAlreadyExistsException(req.slug());
            });
        }

        Category category = categoryRepo.findById(req.categoryId())
            .orElseThrow(() -> new CategoryNotFoundException(req.categoryId()));

        applyRequest(p, req, category);
        return productRepo.save(p);
    }

    public void delete(Long id) {
        Product p = getById(id);
        productRepo.delete(p);
    }

    // ---- Helpers ----

    private void applyRequest(Product p, ProductUpsertRequest req, Category category) {
        setField(p, "slug", req.slug());
        setField(p, "name", req.name());
        setField(p, "description", req.description());
        setField(p, "priceArs", req.priceArs());
        setField(p, "imageUrl", req.imageUrl());
        setField(p, "badge", req.badge());
        setField(p, "ratingAvg", req.ratingAvg());
        setField(p, "ratingCount", req.ratingCount());
        setField(p, "category", category);

        // Replace colors: entities are @OneToMany with orphanRemoval NOT set,
        // so we manage them explicitly via EntityManager to avoid cascade
        // subtleties. This service owns the write side.
        replaceColors(p, req.colors());
        replaceAdditionalImages(p, req.additionalImages());
    }

    /**
     * Replace the extra gallery images. Simpler than replaceColors because
     * these are just strings in an @ElementCollection — no child entity to
     * hydrate, JPA rewrites the join table when we mutate the list.
     */
    private void replaceAdditionalImages(Product p, List<String> urls) {
        p.getAdditionalImages().clear();
        if (urls == null) return;
        for (String url : urls) {
            if (url != null && !url.isBlank()) {
                p.getAdditionalImages().add(url.trim());
            }
        }
    }

    private void replaceColors(Product p, List<String> hexes) {
        // orphanRemoval on Product.colors handles the delete side when we clear.
        // Cascade ALL handles the persist side when we save the parent.
        p.getColors().clear();
        if (hexes == null) return;
        int order = 1;
        for (String hex : hexes) {
            ProductColor c = new ProductColor();
            setField(c, "product", p);
            setField(c, "hex", hex);
            setField(c, "displayOrder", order++);
            p.getColors().add(c);
        }
    }

    /**
     * Domain entities intentionally expose no setters (protected constructors, getters only).
     * Reflection is the least-intrusive way for this write-only service to hydrate them
     * without polluting the entities with public setters that other code could misuse.
     */
    private static void setField(Object target, String fieldName, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), fieldName);
        if (f == null) {
            throw new IllegalStateException("Missing field " + fieldName + " on " + target.getClass());
        }
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
