package com.artesa.payments;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public endpoint MercadoPago calls when a payment changes state.
 *
 * MP sends notifications either as query params (older "IPN" style) or as JSON body
 * (newer "webhooks v1"). We handle both. What we care about is a payment id — we then
 * pull the full payment from MP's API, which is authoritative.
 *
 * We always respond 200 OK quickly: MP retries on non-200, and we don't want to be
 * queued for hours because our DB was slow.
 */
@RestController
@RequestMapping("/api/webhooks/mercadopago")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final PaymentService paymentService;
    private final WebhookSignatureVerifier signatures;

    public WebhookController(PaymentService paymentService, WebhookSignatureVerifier signatures) {
        this.paymentService = paymentService;
        this.signatures = signatures;
    }

    @PostMapping
    public ResponseEntity<Void> notify(
        @RequestParam(name = "id",    required = false) String queryId,
        @RequestParam(name = "topic", required = false) String queryTopic,
        @RequestParam(name = "type",  required = false) String queryType,
        @RequestHeader(name = "x-signature",  required = false) String signatureHeader,
        @RequestHeader(name = "x-request-id", required = false) String requestId,
        @RequestBody(required = false) Map<String, Object> body
    ) {
        String paymentId = resolvePaymentId(queryId, queryTopic, queryType, body);
        if (paymentId == null) {
            log.info("Ignoring webhook without a payment id: query={}/{}/{}, body keys={}",
                queryId, queryTopic, queryType,
                body == null ? "n/a" : body.keySet());
            return ResponseEntity.ok().build();
        }

        // Reject forgeries. In dev (no secret configured) the verifier is inert
        // and returns true with a startup warning.
        if (!signatures.verify(signatureHeader, requestId, paymentId)) {
            // 401 rather than 200 so a genuine misconfiguration is visible instead of
            // silently discarded. MP retries on non-2xx, but a persistent 401 signals
            // "your secret is wrong" — that's what we want.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            paymentService.applyPaymentUpdate(paymentId);
        } catch (Exception e) {
            // Swallow so MP does not retry endlessly on bugs we can't fix by retry.
            log.error("Failed to apply payment update for {}", paymentId, e);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * MP has multiple notification shapes:
     *   ?topic=payment&id=123               (IPN legacy)
     *   ?type=payment&data.id=123           (webhooks v1, in body: {"data":{"id":"123"},"type":"payment"})
     *   {"action":"payment.updated","data":{"id":"123"}}   (webhooks v1)
     * We only act when topic/type is "payment"; merchant_order notifications are dropped.
     */
    @SuppressWarnings("unchecked")
    private String resolvePaymentId(String queryId, String queryTopic, String queryType,
                                    Map<String, Object> body) {
        boolean bodyIsPayment = body != null && "payment".equalsIgnoreCase(String.valueOf(body.get("type")));
        boolean queryIsPayment = "payment".equalsIgnoreCase(queryTopic) || "payment".equalsIgnoreCase(queryType);

        if (queryIsPayment && queryId != null && !queryId.isBlank()) {
            return queryId;
        }
        if (bodyIsPayment && body.get("data") instanceof Map<?, ?> data) {
            Object id = ((Map<String, Object>) data).get("id");
            if (id != null) return String.valueOf(id);
        }
        return null;
    }
}
