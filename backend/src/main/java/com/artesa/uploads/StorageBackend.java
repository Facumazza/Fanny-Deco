package com.artesa.uploads;

import java.io.InputStream;

/**
 * Where the uploaded bytes actually land. Two impls today:
 *   - LocalStorageBackend: writes to a directory on the container's disk (dev).
 *   - R2StorageBackend: PUTs the object into a Cloudflare R2 bucket (prod).
 *
 * The upload validation (magic bytes, MIME check, size cap) lives in
 * UploadService — this interface is purely about persistence.
 */
public interface StorageBackend {

    /**
     * Persist `bytes` under `filename` (a UUID-based name already chosen and
     * validated by UploadService — safe to trust here).
     *
     * @param filename e.g. "3f4b...9c.jpg"
     * @param mimeType detected MIME, e.g. "image/jpeg"
     * @param size     exact byte count (streams can't always tell)
     * @param bytes    input stream positioned at byte 0
     * @return the URL clients should use to fetch the object. For local this
     *         is a relative path like "/uploads/xxx.jpg"; for R2 it's an
     *         absolute https://... URL on the bucket's public domain.
     */
    String store(String filename, String mimeType, long size, InputStream bytes);
}
