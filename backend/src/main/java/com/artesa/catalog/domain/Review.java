package com.artesa.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_name", nullable = false, length = 120)
    private String authorName;

    @Column(nullable = false)
    private short rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(length = 120)
    private String location;

    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Review() {}

    public Long getId() { return id; }
    public String getAuthorName() { return authorName; }
    public short getRating() { return rating; }
    public String getBody() { return body; }
    public String getLocation() { return location; }
    public String getProductName() { return productName; }
    public Instant getCreatedAt() { return createdAt; }
}
