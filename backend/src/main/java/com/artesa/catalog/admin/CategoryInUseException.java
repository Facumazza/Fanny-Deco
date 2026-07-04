package com.artesa.catalog.admin;

public class CategoryInUseException extends RuntimeException {
    private final long productCount;
    public CategoryInUseException(long productCount) {
        super("Cannot delete category with " + productCount + " products");
        this.productCount = productCount;
    }
    public long getProductCount() { return productCount; }
}
