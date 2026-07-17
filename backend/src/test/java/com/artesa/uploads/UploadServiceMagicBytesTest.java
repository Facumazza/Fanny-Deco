package com.artesa.uploads;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure unit test on the static magic-byte matcher — no Spring context, no filesystem.
 * The store() end-to-end path is covered elsewhere.
 */
class UploadServiceMagicBytesTest {

    @Test
    void detectsJpeg() {
        byte[] jpeg = { (byte)0xFF, (byte)0xD8, (byte)0xFF, (byte)0xE0, 0, 0, 0, 0, 0, 0, 0, 0 };
        assertThat(UploadService.detectMimeFromMagic(mock(jpeg))).isEqualTo("image/jpeg");
    }

    @Test
    void detectsPng() {
        byte[] png = {
            (byte)0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0
        };
        assertThat(UploadService.detectMimeFromMagic(mock(png))).isEqualTo("image/png");
    }

    @Test
    void detectsGif87a() {
        byte[] gif = { 'G', 'I', 'F', '8', '7', 'a', 0, 0, 0, 0, 0, 0 };
        assertThat(UploadService.detectMimeFromMagic(mock(gif))).isEqualTo("image/gif");
    }

    @Test
    void detectsGif89a() {
        byte[] gif = { 'G', 'I', 'F', '8', '9', 'a', 0, 0, 0, 0, 0, 0 };
        assertThat(UploadService.detectMimeFromMagic(mock(gif))).isEqualTo("image/gif");
    }

    @Test
    void detectsWebp() {
        byte[] webp = {
            'R', 'I', 'F', 'F', 0x10, 0, 0, 0, 'W', 'E', 'B', 'P'
        };
        assertThat(UploadService.detectMimeFromMagic(mock(webp))).isEqualTo("image/webp");
    }

    @Test
    void rejectsExeMasqueradingAsImage() {
        // MZ header — a Windows PE executable.
        byte[] exe = { 'M', 'Z', (byte)0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0 };
        assertThat(UploadService.detectMimeFromMagic(mock(exe))).isNull();
    }

    @Test
    void rejectsElfBinary() {
        byte[] elf = { (byte)0x7F, 'E', 'L', 'F', 2, 1, 1, 0, 0, 0, 0, 0 };
        assertThat(UploadService.detectMimeFromMagic(mock(elf))).isNull();
    }

    @Test
    void rejectsPlainText() {
        byte[] txt = "Hello world!".getBytes();
        assertThat(UploadService.detectMimeFromMagic(mock(txt))).isNull();
    }

    @Test
    void rejectsSvg() {
        // Even a legitimate SVG is rejected because it isn't in our allow-list
        // (SVG can contain scripts that execute when served inline).
        byte[] svg = "<?xml version=\"1.0\"?><svg".getBytes();
        assertThat(UploadService.detectMimeFromMagic(mock(svg))).isNull();
    }

    @Test
    void rejectsEmpty() {
        assertThat(UploadService.detectMimeFromMagic(mock(new byte[0]))).isNull();
    }

    @Test
    void rejectsTruncatedRiffHeader() {
        // "RIFF" but not enough bytes to check the WEBP tag.
        byte[] partial = { 'R', 'I', 'F', 'F', 0, 0, 0, 0 };
        assertThat(UploadService.detectMimeFromMagic(mock(partial))).isNull();
    }

    private static MockMultipartFile mock(byte[] content) {
        return new MockMultipartFile("file", "x", "application/octet-stream", content);
    }
}
