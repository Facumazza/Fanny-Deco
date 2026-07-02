package com.artesa.catalog.service;

import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductBadge;
import com.artesa.catalog.domain.Review;
import com.artesa.catalog.repository.CategoryRepository;
import com.artesa.catalog.repository.ProductRepository;
import com.artesa.catalog.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {

    @Mock CategoryRepository categoryRepo;
    @Mock ProductRepository productRepo;
    @Mock ReviewRepository reviewRepo;

    @InjectMocks CatalogService service;

    @Test
    void searchProducts_delegatesToRepositoryWithSpecification() {
        Page<Product> emptyPage = new PageImpl<>(List.of());
        when(productRepo.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(emptyPage);

        Page<Product> result = service.searchProducts(
            "carteras-cuero", ProductBadge.NUEVO, "bolso",
            PageRequest.of(0, 12));

        assertThat(result).isSameAs(emptyPage);
        verify(productRepo).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getProduct_throwsWhenSlugMissing() {
        when(productRepo.findBySlug("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProduct("no-existe"))
            .isInstanceOf(ProductNotFoundException.class)
            .hasMessageContaining("no-existe");
    }

    @Test
    void getProduct_returnsWhenFound() {
        Product p = new Product();
        when(productRepo.findBySlug("slug")).thenReturn(Optional.of(p));
        assertThat(service.getProduct("slug")).isSameAs(p);
    }

    @Test
    void latestReviews_clampsLimitToOneMinimum() {
        when(reviewRepo.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(List.<Review>of());

        service.latestReviews(0);

        verify(reviewRepo).findAllByOrderByCreatedAtDesc(
            argThat(p -> p.getPageSize() == 1));
    }

    @Test
    void latestReviews_clampsLimitToTwentyMax() {
        when(reviewRepo.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(List.<Review>of());

        service.latestReviews(999);

        verify(reviewRepo).findAllByOrderByCreatedAtDesc(
            argThat(p -> p.getPageSize() == 20));
    }
}
