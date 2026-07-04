package com.artesa.catalog.admin;

import com.artesa.catalog.admin.dto.CategoryUpsertRequest;
import com.artesa.catalog.domain.Category;
import com.artesa.catalog.repository.CategoryRepository;
import com.artesa.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;

@Service
@Transactional
public class AdminCategoryService {

    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;

    public AdminCategoryService(CategoryRepository categoryRepo,
                                ProductRepository productRepo) {
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
    }

    @Transactional(readOnly = true)
    public List<Category> listAll() {
        return categoryRepo.findAllByOrderByDisplayOrderAscNameAsc();
    }

    @Transactional(readOnly = true)
    public Category getById(Long id) {
        return categoryRepo.findById(id)
            .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public long countProductsIn(Long categoryId) {
        return productRepo.countByCategoryId(categoryId);
    }

    public Category create(CategoryUpsertRequest req) {
        categoryRepo.findBySlug(req.slug()).ifPresent(existing -> {
            throw new SlugAlreadyExistsException(req.slug());
        });
        Category c = new Category();
        applyRequest(c, req);
        return categoryRepo.save(c);
    }

    public Category update(Long id, CategoryUpsertRequest req) {
        Category c = getById(id);
        if (!c.getSlug().equals(req.slug())) {
            categoryRepo.findBySlug(req.slug()).ifPresent(existing -> {
                throw new SlugAlreadyExistsException(req.slug());
            });
        }
        applyRequest(c, req);
        return categoryRepo.save(c);
    }

    public void delete(Long id) {
        Category c = getById(id);
        long count = productRepo.countByCategoryId(id);
        if (count > 0) {
            throw new CategoryInUseException(count);
        }
        categoryRepo.delete(c);
    }

    private void applyRequest(Category c, CategoryUpsertRequest req) {
        setField(c, "slug", req.slug());
        setField(c, "name", req.name());
        setField(c, "subtitle", req.subtitle());
        setField(c, "imageUrl", req.imageUrl());
        setField(c, "displayOrder", req.displayOrder());
    }

    private static void setField(Object target, String fieldName, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), fieldName);
        if (f == null) throw new IllegalStateException("Missing field " + fieldName);
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
