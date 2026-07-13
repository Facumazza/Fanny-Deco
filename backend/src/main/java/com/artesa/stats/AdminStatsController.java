package com.artesa.stats;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final StatsService service;

    public AdminStatsController(StatsService service) {
        this.service = service;
    }

    @GetMapping
    public StatsDto snapshot() {
        return service.snapshot();
    }
}
