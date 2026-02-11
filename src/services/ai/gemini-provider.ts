import { GoogleGenAI } from "@google/genai";
import { AIProvider, VideoAnalysisResult } from "./ai-provider";

const SYSTEM_PROMPT = `You are a video analysis assistant for a bug reporting tool called Vidro.
Given a screen recording, produce:

1. **title** – A short, descriptive title (max 80 chars) summarising the bug or action shown.
2. **description** – 2-4 sentences describing what happens in the recording, including any visible errors, UI interactions, and relevant context.
3. **transcript** – A detailed chronological transcript that combines:
   - Any spoken words (audio transcription)
   - Visual narration of on-screen actions (clicks, navigation, errors, UI changes)
   Format each entry on its own line with approximate timestamps like "[0:05] User clicks the Submit button".

Respond ONLY with valid JSON matching this schema (no markdown fences):
{
  "title": "string",
  "description": "string",
  "transcript": "string"
}`;

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 5000;

export class GeminiProvider implements AIProvider {
    private client: GoogleGenAI;
    private model: string;

    constructor(model = "gemini-2.0-flash") {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }
        this.client = new GoogleGenAI({ apiKey });
        this.model = model;
    }

    async analyzeVideo(videoUrl: string, mimeType: string): Promise<VideoAnalysisResult> {
        // Download the video bytes from the public URL
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video from ${videoUrl}: ${videoResponse.status}`);
        }
        const videoBuffer = await videoResponse.arrayBuffer();
        const base64Video = Buffer.from(videoBuffer).toString("base64");

        // Retry loop for rate-limit (429) errors
        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    inlineData: {
                                        mimeType,
                                        data: base64Video,
                                    },
                                },
                                {
                                    text: SYSTEM_PROMPT,
                                },
                            ],
                        },
                    ],
                });

                const text = response.text?.trim() ?? "";

                // Strip markdown code fences if Gemini wraps the response
                const cleaned = text
                    .replace(/^```json\s*/i, "")
                    .replace(/```\s*$/, "")
                    .trim();

                try {
                    const parsed = JSON.parse(cleaned) as VideoAnalysisResult;
                    return {
                        title: parsed.title || "Untitled Recording",
                        description: parsed.description || "",
                        transcript: parsed.transcript || "",
                    };
                } catch {
                    console.error("Gemini returned non-JSON response:", text);
                    return {
                        title: "Untitled Recording",
                        description: "",
                        transcript: text,
                    };
                }
            } catch (err: unknown) {
                lastError = err instanceof Error ? err : new Error(String(err));
                const errMsg = lastError.message || "";

                // Check for rate-limit / quota errors — retry after delay
                const isRateLimit = errMsg.includes("429") ||
                    errMsg.includes("RESOURCE_EXHAUSTED") ||
                    errMsg.includes("quota");

                if (isRateLimit && attempt < MAX_RETRIES) {
                    // Extract retry delay from error if available, otherwise use exponential backoff
                    const retryMatch = errMsg.match(/retry\s+in\s+([\d.]+)s/i);
                    const delayMs = retryMatch
                        ? Math.ceil(parseFloat(retryMatch[1]) * 1000)
                        : BASE_DELAY_MS * Math.pow(2, attempt);
                    console.warn(`[Gemini] Rate limited. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                }

                // Non-retryable or out of retries — throw a clean error
                if (isRateLimit) {
                    throw new Error("Gemini API quota exceeded. Please wait a moment and try again.");
                }
                throw lastError;
            }
        }

        throw lastError || new Error("AI analysis failed after retries.");
    }
}
