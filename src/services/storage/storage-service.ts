import { StorageProvider } from "./storage-provider";
import { CloudinaryStorageProvider } from "./cloudinary-storage";

/**
 * Factory for the active storage provider.
 *
 * To switch backends, change the class returned here
 * (e.g. swap CloudinaryStorageProvider → R2StorageProvider).
 * Every provider implements the same StorageProvider interface,
 * so the rest of the codebase stays untouched.
 */
export class StorageService {
    private static instance: StorageProvider | null = null;

    public static getProvider(): StorageProvider {
        if (!this.instance) {
            this.instance = new CloudinaryStorageProvider();
        }
        return this.instance;
    }
}
