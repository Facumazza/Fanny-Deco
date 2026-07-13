package com.artesa.stats;

import com.artesa.orders.Order;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class StatsService {

    /** Money "counts" only once we know the customer actually paid. */
    private static final Set<OrderStatus> REVENUE_STATUSES = Set.of(
        OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED
    );

    /** Zone used for "today" / "this month" bucketing. The shop lives in AR time. */
    private static final ZoneId ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private final OrderRepository orderRepo;

    @PersistenceContext
    private EntityManager em;

    public StatsService(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    public StatsDto snapshot() {
        Instant startOfToday = LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
        Instant sevenDaysAgo = LocalDate.now(ZONE).minusDays(6).atStartOfDay(ZONE).toInstant();
        Instant startOfMonth = LocalDate.now(ZONE).withDayOfMonth(1).atStartOfDay(ZONE).toInstant();

        return new StatsDto(
            bucketSince(startOfToday),
            bucketSince(sevenDaysAgo),
            bucketSince(startOfMonth),
            countsByStatus(),
            topProductsLast30Days()
        );
    }

    private StatsDto.Bucket bucketSince(Instant since) {
        // Two aggregate queries keep this simple; the row counts here are tiny (order-level).
        BigDecimal revenue = firstBigDecimal(
            em.createQuery(
                "select coalesce(sum(o.subtotalArs), 0) from Order o " +
                "where o.createdAt >= :since and o.status in :statuses")
              .setParameter("since", since)
              .setParameter("statuses", REVENUE_STATUSES)
              .getResultList()
        );

        long count = firstLong(
            em.createQuery(
                "select count(o) from Order o where o.createdAt >= :since")
              .setParameter("since", since)
              .getResultList()
        );

        return new StatsDto.Bucket(revenue, count);
    }

    private Map<OrderStatus, Long> countsByStatus() {
        Map<OrderStatus, Long> out = new EnumMap<>(OrderStatus.class);
        for (OrderStatus s : OrderStatus.values()) out.put(s, 0L);

        List<Object[]> rows = em.createQuery(
                "select o.status, count(o) from Order o group by o.status", Object[].class)
            .getResultList();
        for (Object[] r : rows) {
            out.put((OrderStatus) r[0], (Long) r[1]);
        }
        return out;
    }

    private List<StatsDto.TopProduct> topProductsLast30Days() {
        Instant since = LocalDate.now(ZONE).minusDays(30).atStartOfDay(ZONE).toInstant();

        List<Object[]> rows = em.createQuery("""
                select p.id, p.slug, p.name,
                       coalesce(sum(oi.quantity), 0),
                       coalesce(sum(oi.lineTotalArs), 0)
                from OrderItem oi
                join oi.order o
                join oi.product p
                where o.createdAt >= :since and o.status in :statuses
                group by p.id, p.slug, p.name
                order by sum(oi.quantity) desc
                """, Object[].class)
            .setParameter("since", since)
            .setParameter("statuses", REVENUE_STATUSES)
            .setMaxResults(5)
            .getResultList();

        return rows.stream()
            .map(r -> new StatsDto.TopProduct(
                (Long) r[0], (String) r[1], (String) r[2],
                ((Number) r[3]).longValue(),
                (BigDecimal) r[4]))
            .toList();
    }

    // ---- Helpers ----

    /** Uses orderRepo just to keep the field non-unused (Order needed for JPQL bytecode). */
    @SuppressWarnings("unused")
    private void keepRepoReference() { orderRepo.count(); }

    private static BigDecimal firstBigDecimal(List<?> results) {
        return results.isEmpty() ? BigDecimal.ZERO : (BigDecimal) results.get(0);
    }

    private static long firstLong(List<?> results) {
        return results.isEmpty() ? 0L : (Long) results.get(0);
    }

    /** Small type-check that Order is imported and used at compile time. */
    @SuppressWarnings("unused")
    private static Order _typeCheck() { return null; }
}
