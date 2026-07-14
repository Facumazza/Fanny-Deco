package com.artesa.reviews;

import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.web.dto.ReviewDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    private final AdminReviewService service;
    private final CatalogMapper mapper;

    public AdminReviewController(AdminReviewService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<ReviewDto> list() {
        return service.listAll().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ReviewDto get(@PathVariable Long id) {
        return mapper.toDto(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ReviewDto> create(@Valid @RequestBody ReviewUpsertRequest req) {
        var created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ReviewDto update(@PathVariable Long id,
                            @Valid @RequestBody ReviewUpsertRequest req) {
        return mapper.toDto(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
