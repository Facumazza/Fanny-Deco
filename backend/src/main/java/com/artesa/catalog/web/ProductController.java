package com.artesa.catalog.web;

import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductBadge;
import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.service.CatalogService;
import com.artesa.catalog.web.dto.PageDto;
import com.artesa.catalog.web.dto.ProductDetailDto;
import com.artesa.catalog.web.dto.ProductSummaryDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final int MAX_PAGE_SIZE = 48;

    private final CatalogService service;
    private final CatalogMapper mapper;

    public ProductController(CatalogService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public PageDto<ProductSummaryDto> list(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) ProductBadge badge,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "created_at,desc") String sort
    ) {
        int clampedSize = Math.max(1, Math.min(MAX_PAGE_SIZE, size));
        int safePage = Math.max(0, page);
        Sort resolved = resolveSort(sort);
        var pageable = PageRequest.of(safePage, clampedSize, resolved);
        var results = service.searchProducts(category, badge, q, pageable);
        return mapper.toPage(results, mapper::toSummary);
    }

    @GetMapping("/{slug}")
    public ProductDetailDto get(@PathVariable String slug) {
        Product p = service.getProduct(slug);
        return mapper.toDetail(p);
    }

    private Sort resolveSort(String raw) {
        return switch (raw) {
            case "price,asc"  -> Sort.by(Sort.Order.asc("priceArs"));
            case "price,desc" -> Sort.by(Sort.Order.desc("priceArs"));
            default           -> Sort.by(Sort.Order.desc("createdAt"));
        };
    }
}
