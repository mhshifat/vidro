import { AIProvider } from "./ai-provider";
import { GroqProvider } from "./groq-provider";

/**
 * Factory for the active AI provider.
 *
 * To switch backends, change the class returned here
 * (e.g. swap GroqProvider → GeminiProvider → OpenAIProvider).
 * Every provider implements the same AIProvider interface,
 * so the rest of the codebase stays untouched.
 */
export class AIService {
    private static instance: AIProvider | null = null;

    public static getProvider(): AIProvider {
        if (!this.instance) {
            this.instance = new GroqProvider();
        }
        return this.instance;
    }

    /** Reset the cached instance (useful for testing or hot-swapping). */
    public static reset(): void {
        this.instance = null;
    }
}
