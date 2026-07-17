package com.artesa.uploads;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URI;

/**
 * Cloudflare R2 backend: PUTs each upload as an object into the configured
 * bucket, then returns the public URL (either R2's `pub-xxx.r2.dev` domain
 * or a custom domain the user CNAMEd to R2).
 *
 * Config (all required when artesa.uploads.provider=r2):
 *   artesa.uploads.r2.account-id         — from Cloudflare dashboard
 *   artesa.uploads.r2.access-key-id      — R2 API token
 *   artesa.uploads.r2.secret-access-key  — R2 API token secret
 *   artesa.uploads.r2.bucket             — bucket name
 *   artesa.uploads.r2.public-base-url    — https://pub-...r2.dev  (no trailing slash)
 *
 * The bucket must have public read access enabled (R2 dashboard → Settings →
 * "R2.dev subdomain" or a custom domain). Otherwise the URLs we return will
 * 401 for customers.
 */
@Component
@ConditionalOnProperty(name = "artesa.uploads.provider", havingValue = "r2")
public class R2StorageBackend implements StorageBackend {

    private final S3Client s3;
    private final String bucket;
    private final String publicBaseUrl;

    public R2StorageBackend(
        @Value("${artesa.uploads.r2.account-id}")        String accountId,
        @Value("${artesa.uploads.r2.access-key-id}")     String accessKeyId,
        @Value("${artesa.uploads.r2.secret-access-key}") String secretAccessKey,
        @Value("${artesa.uploads.r2.bucket}")            String bucket,
        @Value("${artesa.uploads.r2.public-base-url}")   String publicBaseUrl
    ) {
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl.endsWith("/")
            ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
            : publicBaseUrl;
        // R2 uses the S3 API. The endpoint is account-scoped; region 'auto' is
        // what Cloudflare recommends (R2 has no real regions).
        this.s3 = S3Client.builder()
            .endpointOverride(URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
            .region(Region.of("auto"))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
            .build();
    }

    @Override
    public String store(String filename, String mimeType, long size, java.io.InputStream bytes) {
        try {
            s3.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(filename)
                    .contentType(mimeType)
                    .build(),
                // We know the exact size; giving it to the SDK avoids buffering
                // the whole stream to compute Content-Length.
                RequestBody.fromInputStream(bytes, size)
            );
        } catch (S3Exception e) {
            throw new UploadException("STORAGE_ERROR",
                "No se pudo guardar la imagen en R2: " + e.awsErrorDetails().errorMessage());
        }
        return publicBaseUrl + "/" + filename;
    }
}
