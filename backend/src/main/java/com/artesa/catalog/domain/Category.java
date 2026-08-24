package com.artesa.catalog.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 200)
    private String subtitle;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    /**
     * Los productos de esta categoría no se pueden comprar solos: el pedido
     * tiene que incluir al menos un producto de alguna categoría marcada como
     * acompañante. Es el caso de Accesorios.
     */
    @Column(name = "requires_companion", nullable = false)
    private boolean requiresCompanion;

    /** Esta categoría habilita la compra de las que requieren acompañante. */
    @Column(name = "is_companion", nullable = false)
    private boolean companion;

    public Category() {}

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public String getSubtitle() { return subtitle; }
    public String getImageUrl() { return imageUrl; }
    public int getDisplayOrder() { return displayOrder; }
    public boolean requiresCompanion() { return requiresCompanion; }
    public boolean isCompanion() { return companion; }
}
