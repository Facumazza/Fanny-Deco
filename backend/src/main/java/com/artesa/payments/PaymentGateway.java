package com.artesa.payments;

import com.artesa.orders.Order;

/**
 * Abstraction over the payment provider. The rest of the app talks to this;
 * MercadoPagoPaymentGateway is the production impl, and tests can plug a fake.
 */
public interface PaymentGateway {

    /**
     * Create a payment session (in MP jargon, a "preference"). Returns the URL
     * where the client should be redirected to complete the payment.
     */
    PaymentInitiation createInitiation(Order order, PaymentContext ctx);

    /**
     * Fetch the current status of a specific payment (by the provider's payment id,
     * NOT the preference id). Used by the webhook to reconcile.
     */
    PaymentStatusInfo fetchPaymentStatus(String paymentId);
}
