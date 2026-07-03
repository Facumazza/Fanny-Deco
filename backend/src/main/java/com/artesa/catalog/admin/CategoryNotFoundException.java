package com.artesa.catalog.admin;

public class CategoryNotFoundException extends RuntimeException {
    private final Long id;
    public CategoryNotFoundException(Long id) {
        super("Category not found: " + id);
        this.id = id;
    }
    public Long getCategoryId() { return id; }
}
