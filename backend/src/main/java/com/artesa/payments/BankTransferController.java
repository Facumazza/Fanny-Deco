package com.artesa.payments;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Static configuration of the shop's bank account, exposed publicly so the
 * checkout can show CBU/Alias to customers who prefer to transfer instead
 * of paying by card.
 *
 * Bank transfers are NOT integrated with the order status — there's no
 * automatic 'the money arrived' notification the way MP's webhook works.
 * The customer transfers, then the admin verifies in the bank's app and
 * flips the order to PAID from the admin panel by hand.
 *
 * When `enabled` is false the endpoint returns 404 so the frontend hides
 * the option entirely (e.g. if a shop only wants to accept MP).
 */
@RestController
@RequestMapping("/api/payment-methods/bank-transfer")
public class BankTransferController {

    private final boolean enabled;
    private final String bankName;
    private final String accountHolder;
    private final String cbu;
    private final String alias;
    private final String cuit;
    private final String contactMethod;

    public BankTransferController(
        @Value("${artesa.bank-transfer.enabled:true}")          boolean enabled,
        @Value("${artesa.bank-transfer.bank-name:}")            String bankName,
        @Value("${artesa.bank-transfer.account-holder:}")       String accountHolder,
        @Value("${artesa.bank-transfer.cbu:}")                  String cbu,
        @Value("${artesa.bank-transfer.alias:}")                String alias,
        @Value("${artesa.bank-transfer.cuit:}")                 String cuit,
        @Value("${artesa.bank-transfer.contact-method:}")       String contactMethod
    ) {
        this.enabled = enabled;
        this.bankName = bankName;
        this.accountHolder = accountHolder;
        this.cbu = cbu;
        this.alias = alias;
        this.cuit = cuit;
        this.contactMethod = contactMethod;
    }

    public record BankTransferInfo(
        String bankName,
        String accountHolder,
        String cbu,
        String alias,
        String cuit,
        String contactMethod
    ) {}

    @GetMapping
    public org.springframework.http.ResponseEntity<BankTransferInfo> get() {
        // If not enabled OR core fields (CBU/Alias) are missing, tell the
        // frontend the option isn't available so it doesn't render a
        // half-broken checkout choice.
        if (!enabled || (cbu.isBlank() && alias.isBlank())) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        return org.springframework.http.ResponseEntity.ok(new BankTransferInfo(
            bankName, accountHolder, cbu, alias, cuit, contactMethod
        ));
    }
}
