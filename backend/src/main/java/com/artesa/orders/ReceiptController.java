package com.artesa.orders;

import com.artesa.orders.dto.OrderDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Customer-facing endpoint the /orden/:ref/transferencia page POSTs to when
 * the customer uploads their transfer receipt. Public — protected by the
 * unguessable order reference (12 random chars) + rate-limited in
 * RateLimitConfig so a bad actor can't fill the bucket with garbage.
 */
@RestController
@RequestMapping("/api/orders/{reference}/receipt")
public class ReceiptController {

    private final ReceiptService receiptService;
    private final OrderMapper orderMapper;

    public ReceiptController(ReceiptService receiptService, OrderMapper orderMapper) {
        this.receiptService = receiptService;
        this.orderMapper = orderMapper;
    }

    @PostMapping
    public ResponseEntity<OrderDto> upload(@PathVariable String reference,
                                           @RequestParam("file") MultipartFile file) {
        Order updated = receiptService.uploadReceipt(reference, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderMapper.toDto(updated));
    }
}
