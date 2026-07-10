package com.artesa.payments;

import com.artesa.orders.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/{reference}/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    public PaymentController(PaymentService paymentService, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    public record PaymentInitiationDto(String preferenceId, String initPoint) {}

    /**
     * Creates a MercadoPago preference for this order and returns the URL where the
     * customer should be redirected. Public — the order reference is unguessable.
     */
    @PostMapping
    public PaymentInitiationDto initiate(@PathVariable String reference) {
        var order = orderService.getByReference(reference);
        var init = paymentService.initiatePaymentFor(order);
        return new PaymentInitiationDto(init.preferenceId(), init.initPoint());
    }
}
