package com.artesa.catalog.web;

import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.service.CatalogService;
import com.artesa.catalog.web.dto.ReviewDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final CatalogService service;
    private final CatalogMapper mapper;

    public ReviewController(CatalogService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<ReviewDto> latest(@RequestParam(defaultValue = "6") int limit) {
        return service.latestReviews(limit).stream().map(mapper::toDto).toList();
    }
}
