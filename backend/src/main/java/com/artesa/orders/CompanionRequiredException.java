package com.artesa.orders;

import java.util.List;

/**
 * El pedido incluye productos de una categoría que no se vende sola
 * (Accesorios) sin ningún producto que la habilite (una cartera).
 *
 * El front bloquea el checkout antes de llegar acá, pero la regla de negocio
 * vive del lado del servidor: un POST /api/orders armado a mano tiene que
 * rebotar igual.
 */
public class CompanionRequiredException extends RuntimeException {

    private final List<String> blockedCategories;
    private final List<String> companionCategories;

    public CompanionRequiredException(List<String> blockedCategories,
                                      List<String> companionCategories) {
        super("Categorías que requieren acompañante: " + blockedCategories);
        this.blockedCategories = List.copyOf(blockedCategories);
        this.companionCategories = List.copyOf(companionCategories);
    }

    public List<String> getBlockedCategories() { return blockedCategories; }
    public List<String> getCompanionCategories() { return companionCategories; }
}
