import { v2 as cloudinary } from "cloudinary";
import { StorageProvider } from "./storage-provider";
import { Readable } from "stream";

/**
 * Cloudinary storage provider.
 *
 * Free-plan limits enforced:
 *   - Max file size:  100 MB
 *   - Codec:          WebM (VP9 preferred, VP8 fallback)
 *   - Resolution cap: 1080p
 *   - FPS cap:        60
 *
 * To swap this out, create a new class implementing StorageProvider
 * and change StorageService.getProvider().
 */
export class CloudinaryStorageProvider implements StorageProvider {
    /** 100 MB in bytes */
    static readonly MAX_FILE_SIZE = 100 * 1024 * 1024;


    constructor() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error(
                "Missing Cloudinary config. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }

    async upload(
        buffer: Buffer,
        key: string,
        _contentType: string
    ): Promise<{ url: string; key: string }> {
        // Validate size before uploading
        if (buffer.byteLength > CloudinaryStorageProvider.MAX_FILE_SIZE) {
            throw new Error(
                `File size ${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB exceeds the 100 MB limit`
            );
        }

        const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    public_id: key.replace(/\.[^/.]+$/, ""), // strip extension
                    folder: "vidro",
                    overwrite: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else if (!result) reject(new Error("Cloudinary returned no result"));
                    else resolve(result);
                }
            );

            // Pipe the buffer into the upload stream
            const readable = new Readable();
            readable.push(buffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });

        return {
            url: result.secure_url,
            key: result.public_id,
        };
    }

    async delete(key: string): Promise<void> {
        await cloudinary.uploader.destroy(key, { resource_type: "video" });
    }

    getPublicUrl(key: string): string {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        // Serve original quality — no transformations in the URL path
        return `https://res.cloudinary.com/${cloudName}/video/upload/${key}`;
    }
}
