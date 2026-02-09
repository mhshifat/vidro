/**
 * Generic storage provider interface.
 * Implement this to swap in any file storage backend
 * (Cloudflare R2, AWS S3, GCS, MinIO, local disk, etc.)
 */
export interface StorageProvider {
    /**
     * Upload a file and return its public URL and storage key.
     */
    upload(
        buffer: Buffer,
        key: string,
        contentType: string
    ): Promise<{ url: string; key: string }>;

    /**
     * Delete a file by its storage key.
     */
    delete(key: string): Promise<void>;

    /**
     * Get the public URL for a stored file.
     */
    getPublicUrl(key: string): string;
}
