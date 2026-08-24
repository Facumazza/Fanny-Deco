package com.artesa.catalog.web.dto;

public record CategoryDto(
    Long id, String slug, String name, String subtitle, String imageUrl,
    // Reglas de compra: la tienda las usa para bloquear el checkout de un
    // carrito con accesorios sueltos. La validación real vive en el backend
    // (OrderService), esto es sólo para poder avisar antes.
    boolean requiresCompanion, boolean isCompanion
) {}
