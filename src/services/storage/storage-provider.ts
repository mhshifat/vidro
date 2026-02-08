export interface StorageProvider {
    getUploadUrl(fileName: string, contentType: string): Promise<string>;
    getAuthUrl(): string;
    handleCallback(code: string): Promise<unknown>;
    isAuthenticated(userId: string): Promise<boolean>;
}

export abstract class BaseStorageProvider implements StorageProvider {
    abstract getUploadUrl(fileName: string, contentType: string): Promise<string>;
    abstract getAuthUrl(): string;
    abstract handleCallback(code: string): Promise<unknown>;
    abstract isAuthenticated(userId: string): Promise<boolean>;
}
