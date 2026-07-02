package com.artesa.catalog.web;

import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.service.CatalogService;
import com.artesa.catalog.web.dto.CategoryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CatalogService service;
    private final CatalogMapper mapper;

    public CategoryController(CatalogService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<CategoryDto> list() {
        return service.listCategories().stream().map(mapper::toDto).toList();
    }
}
