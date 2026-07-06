package com.artesa.uploads;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/uploads")
public class UploadController {

    private final UploadService service;

    public UploadController(UploadService service) {
        this.service = service;
    }

    public record UploadResponse(String filename, String url) {}

    @PostMapping
    public ResponseEntity<UploadResponse> upload(@RequestParam("file") MultipartFile file) {
        var stored = service.store(file);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new UploadResponse(stored.filename(), stored.url()));
    }
}
