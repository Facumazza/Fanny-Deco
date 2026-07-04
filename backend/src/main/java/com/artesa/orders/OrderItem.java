package com.artesa.orders;

import com.artesa.catalog.domain.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_slug", nullable = false, length = 120)
    private String productSlug;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "product_image_url", nullable = false, columnDefinition = "TEXT")
    private String productImageUrl;

    @Column(length = 7)
    private String color;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceUsd;

    @Column(name = "line_total_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotalUsd;

    public OrderItem() {}

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public Product getProduct() { return product; }
    public String getProductSlug() { return productSlug; }
    public String getProductName() { return productName; }
    public String getProductImageUrl() { return productImageUrl; }
    public String getColor() { return color; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPriceUsd() { return unitPriceUsd; }
    public BigDecimal getLineTotalUsd() { return lineTotalUsd; }
}
