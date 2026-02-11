import OpenAI from "openai";
import type {
    ReportContext,
    SeverityResult,
    ReproStepsResult,
    RootCauseResult,
    TagsResult,
    LogSummaryResult,
    StakeholderSummaryResult,
    SuggestedFixResult,
    DuplicateDetectionResult,
    SmartReplyResult,
} from "./ai-provider";

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 3000;
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

/**
 * AI Insights Service — text-only analysis using Groq.
 * Handles all insight generation: severity, repro steps, root cause,
 * auto-tagging, log summary, stakeholder summary, suggested fix,
 * duplicate detection, smart replies, and natural language search.
 */
export class AIInsightsService {
    private client: OpenAI;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("GROQ_API_KEY is not set");
        this.client = new OpenAI({
            apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });
    }

    /* ─── Internal helpers ──────────────────────────────────────── */

    private buildContext(ctx: ReportContext): string {
        const parts: string[] = [];
        if (ctx.title) parts.push(`**Title:** ${ctx.title}`);
        if (ctx.description) parts.push(`**Description:** ${ctx.description}`);
        if (ctx.transcript) parts.push(`**Transcript:**\n${ctx.transcript}`);
        if (ctx.consoleLogs?.length) {
            const logs = ctx.consoleLogs
                .slice(0, 50) // cap to avoid token overflow
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((l: any) => `[${l.type}] ${l.args?.map((a: any) => typeof a === "string" ? a : JSON.stringify(a)).join(" ")}`)
                .join("\n");
            parts.push(`**Console Logs (${ctx.consoleLogs.length} total):**\n${logs}`);
        }
        if (ctx.networkLogs?.length) {
            const logs = ctx.networkLogs
                .slice(0, 50)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((l: any) => `${l.method} ${l.url} → ${l.status}`)
                .join("\n");
            parts.push(`**Network Logs (${ctx.networkLogs.length} total):**\n${logs}`);
        }
        return parts.join("\n\n");
    }

    private async chat(systemPrompt: string, userPrompt: string): Promise<string> {
        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model: MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    max_tokens: 2000,
                    temperature: 0.3,
                });
                return response.choices[0]?.message?.content?.trim() ?? "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                lastError = err;
                if (err?.status === 429 && attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, BASE_DELAY_MS * (attempt + 1)));
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }

    private parseJSON<T>(text: string): T {
        // 1. Strip markdown fences
        let cleaned = text
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/, "")
            .trim();

        // 2. If the whole string isn't valid JSON, try to extract the first { ... } or [ ... ] block
        if (!(cleaned.startsWith("{") || cleaned.startsWith("["))) {
            const objMatch = cleaned.match(/\{[\s\S]*\}/);
            const arrMatch = cleaned.match(/\[[\s\S]*\]/);
            // Use whichever appears first in the source text
            if (objMatch && arrMatch) {
                cleaned = (cleaned.indexOf(objMatch[0]) <= cleaned.indexOf(arrMatch[0]))
                    ? objMatch[0]
                    : arrMatch[0];
            } else {
                cleaned = objMatch?.[0] ?? arrMatch?.[0] ?? cleaned;
            }
        }

        try {
            return JSON.parse(cleaned) as T;
        } catch {
            console.warn("[AI Insights] JSON parse failed, raw text:", text.slice(0, 200));
            throw new Error("AI returned invalid JSON. Please try again.");
        }
    }

    /* ─── Feature 1: Reproduction Steps ─────────────────────────── */

    async generateReproSteps(ctx: ReportContext): Promise<ReproStepsResult> {
        const system = `You are a QA engineer. Given bug report data, generate clear, numbered reproduction steps in markdown format.
Include: preconditions, step-by-step actions, expected result, actual result.
Respond ONLY with valid JSON: { "steps": "string (markdown)" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<ReproStepsResult>(result);
    }

    /* ─── Feature 2: Severity & Priority Classification ─────────── */

    async classifySeverity(ctx: ReportContext): Promise<SeverityResult> {
        const system = `You are a bug triage specialist. Classify the bug severity and priority based on the report data.

Severity levels:
- critical: App crash, data loss, security vulnerability, complete feature broken
- high: Major feature broken, no workaround, significant user impact
- medium: Feature partially broken, workaround exists, moderate impact
- low: Minor visual issue, edge case, minimal user impact

Priority levels:
- p0: Fix immediately (production down, security breach)
- p1: Fix within 24 hours (major feature broken)
- p2: Fix this sprint (moderate issues)
- p3: Backlog (minor improvements)

Respond ONLY with valid JSON: { "severity": "critical|high|medium|low", "priority": "p0|p1|p2|p3", "reasoning": "string" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<SeverityResult>(result);
    }

    /* ─── Feature 3: Root Cause Analysis ────────────────────────── */

    async analyzeRootCause(ctx: ReportContext): Promise<RootCauseResult> {
        const system = `You are a senior software engineer. Analyze the bug report data (especially console errors, network failures, and visual context) to identify the most likely root cause.

Structure your analysis as:
1. **Probable Root Cause** — What's most likely causing the bug
2. **Evidence** — What data points support this conclusion
3. **Related Systems** — What components/services are involved
4. **Confidence** — How confident you are (high/medium/low) and why

Respond ONLY with valid JSON: { "analysis": "string (markdown)" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<RootCauseResult>(result);
    }

    /* ─── Feature 4: Duplicate Detection ────────────────────────── */

    async detectDuplicates(
        ctx: ReportContext,
        candidates: Array<{ id: string; title: string; description?: string }>
    ): Promise<DuplicateDetectionResult> {
        if (candidates.length === 0) return { duplicates: [] };

        const candidateList = candidates
            .map((c, i) => `${i + 1}. [${c.id}] "${c.title}" — ${c.description || "No description"}`)
            .join("\n");

        const system = `You are a duplicate bug detector. Compare the NEW bug report against existing reports and identify potential duplicates.

Rate similarity from 0-100:
- 80-100: Very likely duplicate
- 50-79: Possibly related
- Below 50: Not a duplicate (do NOT include these)

Only include reports with similarity >= 50.
If NO reports are similar, return an empty array.

IMPORTANT: You MUST respond with ONLY valid JSON, no explanations or text before/after.
Response format: { "duplicates": [{ "reportId": "string", "title": "string", "similarity": number, "reasoning": "string" }] }
If nothing matches: { "duplicates": [] }`;

        const userPrompt = `**NEW BUG REPORT:**\n${this.buildContext(ctx)}\n\n**EXISTING REPORTS:**\n${candidateList}`;
        const result = await this.chat(system, userPrompt);
        return this.parseJSON<DuplicateDetectionResult>(result);
    }

    /* ─── Feature 5: Auto-Tagging ───────────────────────────────── */

    async autoTag(ctx: ReportContext): Promise<TagsResult> {
        const system = `You are a bug categorization system. Analyze the bug report and assign 1-5 relevant tags from this list:

Available tags: UI, Performance, Crash, Auth, API, Network, Database, Security, UX, Accessibility, Mobile, Desktop, Browser, Validation, State Management, Routing, Layout, Animation, Data Loss, Integration

Only pick tags that are clearly relevant. Don't over-tag.

Respond ONLY with valid JSON: { "tags": ["string", ...] }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<TagsResult>(result);
    }

    /* ─── Feature 6: Natural Language Search ────────────────────── */

    async parseSearchQuery(query: string): Promise<{
        keywords: string[];
        filters: {
            severity?: string;
            type?: string;
            hasErrors?: boolean;
            tags?: string[];
        };
        interpretation: string;
    }> {
        const system = `You are a search query parser for a bug reporting tool. Convert a natural language search query into structured search parameters.

Extract:
- keywords: Important search terms to match against title/description/transcript
- filters: Structured filters (severity: critical/high/medium/low, type: VIDEO/SCREENSHOT, hasErrors: true/false, tags: array of tag names)
- interpretation: A one-sentence explanation of what the user is searching for

Respond ONLY with valid JSON: { "keywords": ["string"], "filters": { "severity": "string?", "type": "string?", "hasErrors": boolean?, "tags": ["string"]? }, "interpretation": "string" }`;
        const result = await this.chat(system, query);
        return this.parseJSON(result);
    }

    /* ─── Feature 7: Log Summarization ──────────────────────────── */

    async summarizeLogs(ctx: ReportContext): Promise<LogSummaryResult> {
        const system = `You are a log analysis expert. Summarize the console and network logs from this bug report.

Structure your summary as:
1. **Key Errors** — Most important errors and their likely meaning
2. **Failed Requests** — Any failed API/network calls and what they indicate
3. **Warnings** — Notable warnings that may be related
4. **Pattern** — Any patterns in the logs (repeated errors, cascading failures, etc.)
5. **Timeline** — Brief chronological summary of what happened

Keep it concise but actionable. Focus on what a developer needs to fix the bug.

Respond ONLY with valid JSON: { "summary": "string (markdown)" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<LogSummaryResult>(result);
    }

    /* ─── Feature 8: Stakeholder Summary ────────────────────────── */

    async generateStakeholderSummary(ctx: ReportContext): Promise<StakeholderSummaryResult> {
        const system = `You are a technical communicator. Write a brief, non-technical summary of this bug report suitable for product managers, designers, or executives.

Guidelines:
- No code or technical jargon
- Focus on user impact and business implications
- Include: what's broken, who's affected, how severe it is
- Keep it to 2-4 sentences
- Be clear and direct

Respond ONLY with valid JSON: { "summary": "string" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<StakeholderSummaryResult>(result);
    }

    /* ─── Feature 9: Suggested Fix ──────────────────────────────── */

    async suggestFix(ctx: ReportContext): Promise<SuggestedFixResult> {
        const system = `You are a senior developer. Based on the bug report data, suggest a fix or debugging approach.

Structure your suggestion as:
1. **Likely Fix** — What code change would resolve this
2. **Where to Look** — Which files/components to investigate
3. **Debugging Steps** — How to verify and narrow down the issue
4. **Prevention** — How to prevent similar bugs in the future

Be specific and actionable. Reference error messages and log entries when available.

Respond ONLY with valid JSON: { "suggestion": "string (markdown)" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<SuggestedFixResult>(result);
    }

    /* ─── Feature 10: Smart Comment Replies ─────────────────────── */

    async suggestReplies(
        ctx: ReportContext,
        commentBody: string,
        commentThread?: string[]
    ): Promise<SmartReplyResult> {
        const threadContext = commentThread?.length
            ? `\n\n**Comment Thread:**\n${commentThread.map((c, i) => `${i + 1}. ${c}`).join("\n")}`
            : "";

        const system = `You are a helpful engineering team member. Given a bug report and a comment, suggest 3 concise, relevant reply options.

Guidelines:
- Replies should be 1-2 sentences each
- Mix of: asking for more info, suggesting a fix, acknowledging the issue
- Be professional but friendly
- Make replies contextually relevant to the specific comment and bug

Respond ONLY with valid JSON: { "replies": ["string", "string", "string"] }`;

        const userPrompt = `${this.buildContext(ctx)}\n\n**Comment to reply to:** "${commentBody}"${threadContext}`;
        const result = await this.chat(system, userPrompt);
        return this.parseJSON<SmartReplyResult>(result);
    }
}
