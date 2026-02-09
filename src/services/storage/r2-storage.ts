import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { StorageProvider } from "./storage-provider";

/**
 * Cloudflare R2 storage provider.
 *
 * R2 is S3-compatible, so we use the AWS SDK.
 * To swap to AWS S3, GCS (via S3 compat), MinIO, etc.,
 * just create a new class implementing StorageProvider.
 */
export class R2StorageProvider implements StorageProvider {
    private client: S3Client;
    private bucket: string;
    private publicUrl: string;

    constructor() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucket = process.env.R2_BUCKET_NAME;
        const publicUrl = process.env.R2_PUBLIC_URL;

        if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
            throw new Error(
                "Missing R2 config. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL in .env"
            );
        }

        this.bucket = bucket;
        this.publicUrl = publicUrl.replace(/\/+$/, ""); // strip trailing slash

        this.client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async upload(
        buffer: Buffer,
        key: string,
        contentType: string
    ): Promise<{ url: string; key: string }> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            })
        );

        return {
            url: this.getPublicUrl(key),
            key,
        };
    }

    async delete(key: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            })
        );
    }

    getPublicUrl(key: string): string {
        return `${this.publicUrl}/${key}`;
    }
}
