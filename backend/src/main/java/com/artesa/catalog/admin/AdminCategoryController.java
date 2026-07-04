package com.artesa.catalog.admin;

import com.artesa.catalog.admin.dto.AdminCategoryDto;
import com.artesa.catalog.admin.dto.CategoryUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService service;
    private final AdminCategoryMapper mapper;

    public AdminCategoryController(AdminCategoryService service, AdminCategoryMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<AdminCategoryDto> list() {
        return service.listAll().stream()
            .map(c -> mapper.toDto(c, service.countProductsIn(c.getId())))
            .toList();
    }

    @GetMapping("/{id}")
    public AdminCategoryDto get(@PathVariable Long id) {
        var c = service.getById(id);
        return mapper.toDto(c, service.countProductsIn(id));
    }

    @PostMapping
    public ResponseEntity<AdminCategoryDto> create(@Valid @RequestBody CategoryUpsertRequest req) {
        var created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(mapper.toDto(created, 0));
    }

    @PutMapping("/{id}")
    public AdminCategoryDto update(@PathVariable Long id,
                                   @Valid @RequestBody CategoryUpsertRequest req) {
        var updated = service.update(id, req);
        return mapper.toDto(updated, service.countProductsIn(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
