-- Additional images per product, in display order. Kept as an @ElementCollection
-- (not a full entity) because these are just strings — no metadata, no per-image
-- lifecycle. Product.image_url stays the "primary" (still used in cards, search
-- results, order history); this table is only the extras shown in the detail
-- page gallery.
CREATE TABLE product_additional_images (
    product_id    BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_order INT          NOT NULL,
    image_url     VARCHAR(2000) NOT NULL,
    PRIMARY KEY (product_id, display_order)
);
CREATE INDEX idx_product_add_images_product ON product_additional_images(product_id);
