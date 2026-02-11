import OpenAI from "openai";
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

                // Strip markdown code fences if the model wraps the response
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
                    console.error("OpenAI returned non-JSON response:", text);
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
                    console.warn(`[OpenAI] Rate limited. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
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
