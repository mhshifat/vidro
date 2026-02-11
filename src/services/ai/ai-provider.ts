/**
 * Result of AI video/image analysis.
 */
export interface VideoAnalysisResult {
    /** A concise, descriptive title for the recording */
    title: string;
    /** A summary description of what happens in the recording */
    description: string;
    /** Full transcript: speech (audio) + visual activity narration */
    transcript: string;
}

/* ─── AI Insight Types ─────────────────────────────────────────── */

export interface SeverityResult {
    severity: "critical" | "high" | "medium" | "low";
    priority: "p0" | "p1" | "p2" | "p3";
    reasoning: string;
}

export interface ReproStepsResult {
    steps: string; // markdown formatted
}

export interface RootCauseResult {
    analysis: string;
}

export interface TagsResult {
    tags: string[]; // e.g. ["UI","Performance","API","Auth","Crash"]
}

export interface LogSummaryResult {
    summary: string;
}

export interface StakeholderSummaryResult {
    summary: string;
}

export interface SuggestedFixResult {
    suggestion: string;
}

export interface DuplicateCandidate {
    reportId: string;
    title: string;
    similarity: number; // 0-100
    reasoning: string;
}

export interface DuplicateDetectionResult {
    duplicates: DuplicateCandidate[];
}

export interface SmartReplyResult {
    replies: string[];
}

/** Context passed into insight-generating methods */
export interface ReportContext {
    title?: string;
    description?: string;
    transcript?: string;
    consoleLogs?: unknown[];
    networkLogs?: unknown[];
}

/**
 * Generic AI provider interface.
 * Implement this to swap in any AI backend
 * (Gemini, OpenAI, Anthropic, local models, etc.)
 */
export interface AIProvider {
    /**
     * Analyse a video and return title, description, and transcript.
     *
     * @param videoUrl  Public URL of the uploaded video (e.g. Cloudinary URL)
     * @param mimeType  MIME type of the file (e.g. "video/webm")
     */
    analyzeVideo(videoUrl: string, mimeType: string): Promise<VideoAnalysisResult>;
}
