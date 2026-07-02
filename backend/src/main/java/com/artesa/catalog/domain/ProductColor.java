package com.artesa.catalog.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "product_colors")
public class ProductColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 7)
    private String hex;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected ProductColor() {}

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getHex() { return hex; }
    public int getDisplayOrder() { return displayOrder; }
}
