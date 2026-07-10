package com.artesa.payments;

import java.math.BigDecimal;

/**
 * Provider-agnostic snapshot of a payment. The `status` values follow MP's
 * vocabulary — approved / pending / rejected / cancelled / refunded / in_process —
 * because they map cleanly to our OrderStatus.
 */
public record PaymentStatusInfo(
    String paymentId,
    String preferenceId,        // MP: "external_reference"? no — MP calls this order.id; we set external_reference to our order reference
    String externalReference,   // Our order reference, roundtripped back
    String status,              // approved | pending | rejected | cancelled | refunded | in_process
    String paymentMethod,       // credit_card | debit_card | ticket | bank_transfer | ...
    BigDecimal amount
) {}
