import OpenAI from "openai";
import { AIProvider, VideoAnalysisResult, extractJsonFromResponse } from "./ai-provider";
import { Logger } from "@/lib/logger";

const SYSTEM_PROMPT = `You are a video analysis assistant for a bug reporting tool called Vidro.
Given a screen recording, produce:

1. **title** – A short, descriptive title (max 80 chars) summarising the bug or action shown.
2. **description** – 2-4 sentences describing what happens in the recording, including any visible errors, UI interactions, and relevant context.
3. **transcript** – A detailed chronological transcript that combines:
   - Any spoken words (audio transcription)
   - Visual narration of on-screen actions (clicks, navigation, errors, UI changes)
   Format each entry on its own line with approximate timestamps like "[0:05] User clicks the Submit button".

IMPORTANT: Ignore any Vidro extension UI elements visible in the recording (e.g. recording overlays, stop/pause buttons, "screen sharing" indicators, floating toolbars, or pop-ups from the Vidro extension). These are part of the recording tool itself and should NOT be mentioned in the title, description, or transcript. Focus only on the actual application content and user actions.

Respond ONLY with valid JSON matching this schema (no markdown fences):
{
  "title": "string",
  "description": "string",
  "transcript": "string"
}`;

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 5000;

export class OpenAIProvider implements AIProvider {
    private client: OpenAI;
    private model: string;

    constructor(model = "gpt-4o") {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is not set in environment variables");
        }
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async analyzeVideo(videoUrl: string, _mimeType: string): Promise<VideoAnalysisResult> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model: this.model,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: videoUrl,
                                        detail: "auto",
                                    },
                                },
                                {
                                    type: "text",
                                    text: SYSTEM_PROMPT,
                                },
                            ],
                        },
                    ],
                    max_tokens: 2000,
                });

                const text = response.choices[0]?.message?.content?.trim() ?? "";
                const cleaned = extractJsonFromResponse(text);

                try {
                    const parsed = JSON.parse(cleaned) as VideoAnalysisResult;
                    return {
                        title: parsed.title || "Untitled Recording",
                        description: parsed.description || "",
                        transcript: parsed.transcript || "",
                    };
                } catch {
                    const ctx = Logger.createContext();
                    Logger.warn("OpenAI returned non-JSON response", ctx, { response: text.slice(0, 500), provider: "OpenAI" });
                    return {
                        title: "Untitled Recording",
                        description: "",
                        transcript: text,
                    };
                }
            } catch (err: unknown) {
                lastError = err instanceof Error ? err : new Error(String(err));
                const errMsg = lastError.message || "";

                const isRateLimit = errMsg.includes("429") ||
                    errMsg.includes("rate_limit") ||
                    errMsg.includes("Rate limit");

                if (isRateLimit && attempt < MAX_RETRIES) {
                    const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
                    const ctx = Logger.createContext();
                    Logger.warn("Rate limited, retrying", ctx, { delayMs, attempt: attempt + 1, maxRetries: MAX_RETRIES, provider: "OpenAI" });
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                }

                if (isRateLimit) {
                    throw new Error("OpenAI API rate limit exceeded. Please wait a moment and try again.");
                }
                throw lastError;
            }
        }

        throw lastError || new Error("AI analysis failed after retries.");
    }
}
