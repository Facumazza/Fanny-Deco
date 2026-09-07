package com.artesa.common;

import com.artesa.catalog.admin.CategoryInUseException;
import com.artesa.catalog.admin.CategoryNotFoundException;
import com.artesa.catalog.admin.SlugAlreadyExistsException;
import com.artesa.catalog.service.ProductNotFoundException;
import com.artesa.orders.CompanionRequiredException;
import com.artesa.orders.OrderNotFoundException;
import com.artesa.reviews.ReviewNotFoundException;
import com.artesa.uploads.UploadException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiError> productNotFound(ProductNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of("PRODUCT_NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ApiError> orderNotFound(OrderNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of("ORDER_NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(ReviewNotFoundException.class)
    public ResponseEntity<ApiError> reviewNotFound(ReviewNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of("REVIEW_NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(UploadException.class)
    public ResponseEntity<ApiError> uploadError(UploadException e) {
        return ResponseEntity.badRequest()
            .body(ApiError.of(e.getCode(), e.getMessage()));
    }

    // Note: this returns 400 (not 404) because CategoryNotFoundException is thrown
    // both from admin category GET (where 404 would be idiomatic) and from product
    // upsert with a bad categoryId (where 400 is idiomatic). We keep 400 for
    // consistency with the existing product-upsert contract.
    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiError> categoryNotFound(CategoryNotFoundException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiError.of("CATEGORY_NOT_FOUND",
                "La categoría con id " + e.getCategoryId() + " no existe"));
    }

    @ExceptionHandler(CategoryInUseException.class)
    public ResponseEntity<ApiError> categoryInUse(CategoryInUseException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError.of("CATEGORY_IN_USE",
                "La categoría tiene " + e.getProductCount()
                + " producto(s). Movelos o borralos antes."));
    }

    @ExceptionHandler(SlugAlreadyExistsException.class)
    public ResponseEntity<ApiError> slugConflict(SlugAlreadyExistsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError.of("SLUG_ALREADY_EXISTS",
                "Ya existe un producto con el slug '" + e.getSlug() + "'"));
    }

    // El carrito tiene accesorios sueltos. 422 y no 400: el JSON es válido,
    // lo que no se cumple es la regla de negocio. El mensaje se muestra tal
    // cual en el checkout, así que se arma con los nombres reales de las
    // categorías involucradas.
    @ExceptionHandler(CompanionRequiredException.class)
    public ResponseEntity<ApiError> companionRequired(CompanionRequiredException e) {
        String blocked = String.join(", ", e.getBlockedCategories());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiError.of("COMPANION_REQUIRED",
                "Los productos de " + blocked + " no se venden solos: "
                + "sumá al pedido " + companionHint(e.getCompanionCategories()) + "."));
    }

    /**
     * Casi todas las categorías habilitan, así que enumerarlas daría un
     * mensaje de varios renglones. Se listan sólo si son pocas; si no, se
     * dice lo mismo en corto.
     */
    private static String companionHint(java.util.List<String> companions) {
        if (companions.isEmpty() || companions.size() > 3) {
            return "una cartera u otra pieza de la tienda";
        }
        return "un producto de " + String.join(" o ", companions);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> typeMismatch(MethodArgumentTypeMismatchException e) {
        String msg = "Invalid value for parameter '" + e.getName() + "'";
        return ResponseEntity.badRequest().body(ApiError.of("BAD_REQUEST", msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        String details = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest()
            .body(ApiError.of("VALIDATION_ERROR",
                details.isBlank() ? "Datos inválidos" : details));
    }
}
