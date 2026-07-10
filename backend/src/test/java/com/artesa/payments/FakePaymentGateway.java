package com.artesa.payments;

import com.artesa.orders.Order;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Test-only PaymentGateway. Lets ITs assert the payments module without hitting MP's API.
 * Wired via @Import(FakePaymentGateway.Config.class) or as a @Primary bean.
 */
public class FakePaymentGateway implements PaymentGateway {

    private final AtomicLong idSeq = new AtomicLong(1000);
    private final Map<String, PaymentStatusInfo> paymentsById = new HashMap<>();
    private final Map<String, String> orderRefByPreference = new HashMap<>();

    @Override
    public PaymentInitiation createInitiation(Order order, PaymentContext ctx) {
        String preferenceId = "pref-" + idSeq.incrementAndGet();
        orderRefByPreference.put(preferenceId, order.getReference());
        return new PaymentInitiation(
            preferenceId,
            "https://fake.mp.local/checkout/" + preferenceId
        );
    }

    @Override
    public PaymentStatusInfo fetchPaymentStatus(String paymentId) {
        PaymentStatusInfo hit = paymentsById.get(paymentId);
        if (hit == null) {
            throw new PaymentException("MP_API_ERROR", "unknown payment");
        }
        return hit;
    }

    /** Test helper: simulate a payment that MP would have recorded. */
    public String recordPayment(String orderRef, String status, String method, BigDecimal amount) {
        String pid = String.valueOf(idSeq.incrementAndGet());
        paymentsById.put(pid, new PaymentStatusInfo(pid, null, orderRef, status, method, amount));
        return pid;
    }

    @TestConfiguration
    @ConditionalOnProperty(name = "artesa.payments.provider",
                           havingValue = "fake", matchIfMissing = false)
    public static class Config {
        @Bean
        @Primary
        public FakePaymentGateway fakePaymentGateway() {
            return new FakePaymentGateway();
        }
    }
}
