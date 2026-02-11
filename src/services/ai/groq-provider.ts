import OpenAI from "openai";
import { AIProvider, VideoAnalysisResult } from "./ai-provider";

/**
 * Build the system prompt. When an audio transcript is available,
 * it is injected so the vision model can correlate speech with on-screen actions.
 */
function buildSystemPrompt(audioTranscript?: string): string {
    const audioSection = audioTranscript
        ? `\n\nYou also have the following AUDIO TRANSCRIPT from the recording:\n"""\n${audioTranscript}\n"""\nUse this audio transcript together with the visual frames to produce a richer, more accurate result. Combine spoken words with on-screen actions in the transcript.`
        : "";

    return `You are a video analysis assistant for a bug reporting tool called Vidro.
You will be shown several frames captured at different timestamps from a screen recording.
Analyse ALL frames together as a sequence to understand the full recording, then produce:

1. **title** – A short, descriptive title (max 80 chars) summarising the bug or action shown.
2. **description** – 2-4 sentences describing what happens in the recording, including any visible errors, UI interactions, and relevant context.
3. **transcript** – A detailed chronological transcript narrating on-screen actions (clicks, navigation, errors, UI changes) based on the frame sequence.
   Format each entry on its own line with approximate timestamps like "[0:05] User clicks the Submit button".${audioSection}

Respond ONLY with valid JSON matching this schema (no markdown fences):
{
  "title": "string",
  "description": "string",
  "transcript": "string"
}`;
}

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 5000;

/** Offsets (in seconds) to extract frames from the video via Cloudinary.
 *  Groq vision models support a maximum of 5 images per request. */
const FRAME_OFFSETS = [0, 5, 10, 20, 30];
const MAX_FRAMES = 5;

/**
 * Convert a Cloudinary video URL into a JPEG thumbnail at a given second offset.
 * e.g. .../video/upload/v123/path.webm → .../video/upload/so_5,f_jpg,w_1280/v123/path.jpg
 */
function cloudinaryFrameUrl(videoUrl: string, offsetSeconds: number): string {
    return videoUrl
        .replace(/\/upload\//, `/upload/so_${offsetSeconds},f_jpg,w_1280/`)
        .replace(/\.\w+$/, ".jpg");
}

/**
 * Check which frame URLs are actually reachable (offset may exceed video duration).
 */
async function getValidFrameUrls(videoUrl: string): Promise<string[]> {
    const urls = FRAME_OFFSETS.map(s => cloudinaryFrameUrl(videoUrl, s));
    const checks = await Promise.all(
        urls.map(async (url) => {
            try {
                const res = await fetch(url, { method: "HEAD" });
                return res.ok ? url : null;
            } catch {
                return null;
            }
        })
    );
    return checks.filter((u): u is string => u !== null).slice(0, MAX_FRAMES);
}

/**
 * Groq AI provider — uses OpenAI-compatible API.
 * Free tier, no credit card required.
 * Get your key at https://console.groq.com
 *
 * Since Groq vision models only support images (not video),
 * we extract multiple frames from the video via Cloudinary
 * URL transformations and send them as a sequence.
 */
export class GroqProvider implements AIProvider {
    private client: OpenAI;
    private model: string;
    private apiKey: string;

    constructor(model = "meta-llama/llama-4-scout-17b-16e-instruct") {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not set in environment variables");
        }
        this.apiKey = apiKey;
        this.client = new OpenAI({
            apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });
        this.model = model;
    }

    /**
     * Transcribe audio from a video URL using Groq's Whisper API.
     * Uses the `url` parameter so Groq fetches the video directly (no local download).
     * Returns empty string on failure (graceful fallback).
     */
    private async transcribeAudio(videoUrl: string): Promise<string> {
        try {
            console.log("[Groq] Transcribing audio with Whisper...");

            const formData = new FormData();
            formData.append("model", "whisper-large-v3-turbo");
            formData.append("url", videoUrl);
            formData.append("response_format", "verbose_json");
            formData.append("language", "en");

            const response = await fetch(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errText = await response.text();
                console.warn("[Groq] Whisper transcription failed:", response.status, errText);
                return "";
            }

            const result = await response.json() as { text?: string };
            const transcript = result.text?.trim() || "";
            console.log(`[Groq] Whisper transcription completed: ${transcript.length} chars`);
            return transcript;
        } catch (err) {
            console.warn("[Groq] Whisper transcription error:", err);
            return "";
        }
    }

    async analyzeVideo(videoUrl: string, _mimeType: string): Promise<VideoAnalysisResult> {
        const isVideo = /\.(webm|mp4|mov|avi|mkv)(\?|$)/i.test(videoUrl);
        const isCloudinary = videoUrl.includes("cloudinary.com");

        // Run frame extraction and Whisper transcription in parallel
        const [imageUrls, audioTranscript] = await Promise.all([
            (async () => {
                if (isVideo && isCloudinary) {
                    console.log("[Groq] Extracting frames from Cloudinary video...");
                    const frames = await getValidFrameUrls(videoUrl);
                    if (frames.length === 0) {
                        return [cloudinaryFrameUrl(videoUrl, 0)];
                    }
                    console.log(`[Groq] Using ${frames.length} frames for analysis`);
                    return frames;
                }
                return [videoUrl];
            })(),
            isVideo ? this.transcribeAudio(videoUrl) : Promise.resolve(""),
        ]);

        const imageParts: OpenAI.Chat.Completions.ChatCompletionContentPartImage[] =
            imageUrls.map(url => ({
                type: "image_url" as const,
                image_url: { url },
            }));

        const systemPrompt = buildSystemPrompt(audioTranscript || undefined);

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model: this.model,
                    messages: [
                        {
                            role: "user",
                            content: [
                                ...imageParts,
                                {
                                    type: "text",
                                    text: systemPrompt,
                                },
                            ],
                        },
                    ],
                    max_tokens: 2000,
                    temperature: 0.3,
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
                    console.error("Groq returned non-JSON response:", text);
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
                    console.warn(`[Groq] Rate limited. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                }

                if (isRateLimit) {
                    throw new Error("Groq API rate limit exceeded. Please wait a moment and try again.");
                }
                throw lastError;
            }
        }

        throw lastError || new Error("AI analysis failed after retries.");
    }
}
