package com.artesa.orders.admin;

import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.web.dto.PageDto;
import com.artesa.orders.OrderMapper;
import com.artesa.orders.OrderStatus;
import com.artesa.orders.admin.dto.AdminOrderSummaryDto;
import com.artesa.orders.admin.dto.UpdateOrderStatusRequest;
import com.artesa.orders.admin.dto.UpdateTrackingRequest;
import com.artesa.orders.dto.OrderDto;
import com.artesa.payments.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private static final int MAX_PAGE_SIZE = 100;

    private final AdminOrderService service;
    private final AdminOrderMapper adminMapper;
    private final OrderMapper orderMapper;
    private final CatalogMapper catalogMapper;
    private final PaymentService paymentService;

    public AdminOrderController(AdminOrderService service,
                                AdminOrderMapper adminMapper,
                                OrderMapper orderMapper,
                                CatalogMapper catalogMapper,
                                PaymentService paymentService) {
        this.service = service;
        this.adminMapper = adminMapper;
        this.orderMapper = orderMapper;
        this.catalogMapper = catalogMapper;
        this.paymentService = paymentService;
    }

    @GetMapping
    public PageDto<AdminOrderSummaryDto> list(
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        int clampedSize = Math.max(1, Math.min(MAX_PAGE_SIZE, size));
        int safePage = Math.max(0, page);
        var pageable = PageRequest.of(safePage, clampedSize,
            Sort.by(Sort.Order.desc("createdAt")));
        var results = service.search(status, q, pageable);
        return catalogMapper.toPage(results, adminMapper::toSummary);
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable Long id) {
        return orderMapper.toDto(service.getById(id));
    }

    @PutMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id,
                                 @Valid @RequestBody UpdateOrderStatusRequest req) {
        var updated = service.updateStatus(id, req.status());
        return orderMapper.toDto(updated);
    }

    @PutMapping("/{id}/tracking")
    public OrderDto updateTracking(@PathVariable Long id,
                                   @Valid @RequestBody UpdateTrackingRequest req) {
        var updated = service.updateTracking(id, req.trackingInfo());
        return orderMapper.toDto(updated);
    }

    /** Full refund through MP + flips order to REFUNDED + notifies the customer. */
    @PostMapping("/{id}/refund")
    public OrderDto refund(@PathVariable Long id) {
        var order = service.getById(id);
        var refunded = paymentService.refundOrder(order);
        return orderMapper.toDto(refunded);
    }

    /**
     * Hard-delete an order — used for admin cleanup (test orders, spam, etc.).
     * Cascades to order_items. Does NOT refund payment: if you need the money
     * back, POST /refund first, then delete.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
