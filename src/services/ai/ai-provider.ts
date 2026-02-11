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

/* ─── Round 2 AI Feature Types ─────────────────────────────────── */

export interface AccessibilityAuditResult {
    issues: Array<{
        rule: string;
        severity: "critical" | "serious" | "moderate" | "minor";
        description: string;
        recommendation: string;
    }>;
    summary: string;
    score: number; // 0-100
}

export interface PerformanceAnalysisResult {
    bottlenecks: Array<{
        type: string;
        description: string;
        impact: "high" | "medium" | "low";
        suggestion: string;
    }>;
    summary: string;
}

export interface SecurityScanResult {
    vulnerabilities: Array<{
        type: string;
        severity: "critical" | "high" | "medium" | "low";
        description: string;
        recommendation: string;
    }>;
    summary: string;
}

export interface TestCaseResult {
    testCases: string; // markdown formatted test cases
}

export interface SentimentResult {
    sentiment: "frustrated" | "neutral" | "constructive";
    urgency: "critical" | "high" | "medium" | "low";
    reasoning: string;
}

export interface TranslationResult {
    language: string;
    title: string;
    description: string;
}

export interface WeeklyDigestResult {
    summary: string;
    topIssues: Array<{ title: string; severity: string; count: number }>;
    trends: string;
    recommendations: string;
}

export interface SmartAssignmentResult {
    suggestedAssignee: string;
    reasoning: string;
    requiredSkills: string[];
}

export interface VideoHighlightResult {
    startTime: number;
    endTime: number;
    description: string;
    confidence: "high" | "medium" | "low";
}

export interface VisualDiffResult {
    differences: Array<{
        area: string;
        description: string;
        severity: "major" | "minor" | "cosmetic";
    }>;
    summary: string;
    overallSimilarity: number; // 0-100
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
