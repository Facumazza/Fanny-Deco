package com.artesa.payments;

import com.artesa.orders.Order;
import com.artesa.orders.OrderItem;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * MercadoPago-backed PaymentGateway. Wired only when `artesa.payments.provider=mercadopago`
 * so tests can plug a fake without dragging the SDK into the context.
 */
@Component
@ConditionalOnProperty(name = "artesa.payments.provider", havingValue = "mercadopago", matchIfMissing = false)
public class MercadoPagoPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoPaymentGateway.class);
    private static final String CURRENCY_ARS = "ARS";

    private final String accessToken;

    public MercadoPagoPaymentGateway(@Value("${artesa.payments.mercadopago.access-token:}") String accessToken) {
        this.accessToken = accessToken;
    }

    @PostConstruct
    void init() {
        if (accessToken == null || accessToken.isBlank()) {
            log.warn("MercadoPago access token is empty — payments will fail until it's set.");
            return;
        }
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    @Override
    public PaymentInitiation createInitiation(Order order, PaymentContext ctx) {
        List<PreferenceItemRequest> items = new ArrayList<>();
        for (OrderItem oi : order.getItems()) {
            items.add(PreferenceItemRequest.builder()
                .title(truncate(oi.getProductName(), 250))
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPriceArs())
                .currencyId(CURRENCY_ARS)
                .build());
        }

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
            .success(ctx.successUrl())
            .failure(ctx.failureUrl())
            .pending(ctx.pendingUrl())
            .build();

        PreferenceRequest request = PreferenceRequest.builder()
            .items(items)
            .backUrls(backUrls)
            .autoReturn("approved")
            .externalReference(order.getReference())
            .notificationUrl(ctx.webhookUrl())
            .build();

        try {
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(request);
            return new PaymentInitiation(preference.getId(), preference.getInitPoint());
        } catch (MPApiException e) {
            log.error("MercadoPago API error creating preference: status={}, body={}",
                e.getStatusCode(), e.getApiResponse() == null ? "n/a" : e.getApiResponse().getContent());
            throw new PaymentException("MP_API_ERROR", "MercadoPago rejected the preference");
        } catch (MPException e) {
            log.error("MercadoPago SDK error creating preference", e);
            throw new PaymentException("MP_SDK_ERROR", "No se pudo iniciar el pago");
        }
    }

    @Override
    public PaymentStatusInfo fetchPaymentStatus(String paymentId) {
        try {
            Payment payment = new PaymentClient().get(Long.valueOf(paymentId));
            BigDecimal amount = payment.getTransactionAmount();
            return new PaymentStatusInfo(
                String.valueOf(payment.getId()),
                null,
                payment.getExternalReference(),
                payment.getStatus(),
                payment.getPaymentMethodId(),
                amount
            );
        } catch (NumberFormatException e) {
            throw new PaymentException("BAD_PAYMENT_ID", "Payment id must be numeric");
        } catch (MPApiException e) {
            log.error("MercadoPago API error fetching payment {}: status={}", paymentId, e.getStatusCode());
            throw new PaymentException("MP_API_ERROR", "MercadoPago no encontró el pago");
        } catch (MPException e) {
            log.error("MercadoPago SDK error fetching payment " + paymentId, e);
            throw new PaymentException("MP_SDK_ERROR", "Error consultando el pago");
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max);
    }
}
