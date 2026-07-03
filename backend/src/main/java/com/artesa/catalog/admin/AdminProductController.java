package com.artesa.catalog.admin;

import com.artesa.catalog.admin.dto.AdminProductDto;
import com.artesa.catalog.admin.dto.ProductUpsertRequest;
import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.web.dto.PageDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private static final int MAX_PAGE_SIZE = 100;

    private final AdminProductService service;
    private final AdminProductMapper mapper;
    private final CatalogMapper catalogMapper;

    public AdminProductController(AdminProductService service,
                                  AdminProductMapper mapper,
                                  CatalogMapper catalogMapper) {
        this.service = service;
        this.mapper = mapper;
        this.catalogMapper = catalogMapper;
    }

    @GetMapping
    public PageDto<AdminProductDto> list(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        int clampedSize = Math.max(1, Math.min(MAX_PAGE_SIZE, size));
        int safePage = Math.max(0, page);
        var pageable = PageRequest.of(safePage, clampedSize,
            Sort.by(Sort.Order.desc("createdAt")));
        var results = service.listProducts(q, pageable);
        return catalogMapper.toPage(results, mapper::toDto);
    }

    @GetMapping("/{id}")
    public AdminProductDto get(@PathVariable Long id) {
        return mapper.toDto(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<AdminProductDto> create(@Valid @RequestBody ProductUpsertRequest req) {
        var created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public AdminProductDto update(@PathVariable Long id,
                                  @Valid @RequestBody ProductUpsertRequest req) {
        return mapper.toDto(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
