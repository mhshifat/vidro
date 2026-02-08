import { YoutubeStorage } from "./youtube-storage";
import { StorageProvider } from "./storage-provider";

export class StorageService {
    public static getProvider(): StorageProvider & { getCredentials(userId: string): Promise<string | null | undefined> } {
        // In the future, we can switch based on config
        return new YoutubeStorage();
    }
}
