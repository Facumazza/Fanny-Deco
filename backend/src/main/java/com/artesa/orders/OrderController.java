package com.artesa.orders;

import com.artesa.orders.dto.CreateOrderRequest;
import com.artesa.orders.dto.OrderDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public storefront endpoints. Guest checkout — no auth required.
 * The order reference is returned to the caller and doubles as an unguessable
 * token to look the order up later (e.g. from the confirmation email).
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;
    private final OrderMapper mapper;

    public OrderController(OrderService service, OrderMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest req) {
        Order created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @GetMapping("/{reference}")
    public OrderDto getByReference(@PathVariable String reference) {
        return mapper.toDto(service.getByReference(reference));
    }
}
