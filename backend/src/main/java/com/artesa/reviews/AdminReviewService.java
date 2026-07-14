package com.artesa.reviews;

import com.artesa.catalog.domain.Review;
import com.artesa.catalog.repository.ReviewRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class AdminReviewService {

    private final ReviewRepository repo;

    public AdminReviewService(ReviewRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Review> listAll() {
        return repo.findAll(Sort.by(Sort.Order.desc("createdAt")));
    }

    @Transactional(readOnly = true)
    public Review getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ReviewNotFoundException(id));
    }

    public Review create(ReviewUpsertRequest req) {
        Review r = new Review();
        apply(r, req);
        setField(r, "createdAt", Instant.now());
        return repo.save(r);
    }

    public Review update(Long id, ReviewUpsertRequest req) {
        Review r = getById(id);
        apply(r, req);
        return repo.save(r);
    }

    public void delete(Long id) {
        repo.delete(getById(id));
    }

    private void apply(Review r, ReviewUpsertRequest req) {
        setField(r, "authorName", req.authorName().trim());
        setField(r, "rating", (short) req.rating().intValue());
        setField(r, "body", req.body().trim());
        setField(r, "location", blankToNull(req.location()));
        setField(r, "productName", blankToNull(req.productName()));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static void setField(Object target, String name, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), name);
        if (f == null) throw new IllegalStateException("Missing field " + name);
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
