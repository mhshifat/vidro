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
    AccessibilityAuditResult,
    PerformanceAnalysisResult,
    SecurityScanResult,
    TestCaseResult,
    SentimentResult,
    TranslationResult,
    WeeklyDigestResult,
    SmartAssignmentResult,
    VideoHighlightResult,
    VisualDiffResult,
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

    private async chat(systemPrompt: string, userPrompt: string, maxTokens = 2000): Promise<string> {
        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model: MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    max_tokens: maxTokens,
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

        // 3. Try parsing as-is
        try {
            return JSON.parse(cleaned) as T;
        } catch {
            // 4. Attempt to fix truncated JSON by closing open braces/brackets
            let fixAttempt = cleaned;
            const opens = (fixAttempt.match(/\{/g) || []).length;
            const closes = (fixAttempt.match(/\}/g) || []).length;
            if (opens > closes) {
                // Remove any trailing incomplete key/value (after the last comma or colon)
                fixAttempt = fixAttempt.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"{}\[\]]*$/, "");
                fixAttempt += "}".repeat(opens - closes);
            }
            try {
                return JSON.parse(fixAttempt) as T;
            } catch {
                console.warn("[AI Insights] JSON parse failed, raw text:", text.slice(0, 300));
                throw new Error("AI returned invalid JSON. Please try again.");
            }
        }
    }

    /* ─── Feature 1: Reproduction Steps ─────────────────────────── */

    async generateReproSteps(ctx: ReportContext): Promise<ReproStepsResult> {
        const system = `You are a QA engineer. Given bug report data, generate clear, numbered reproduction steps in markdown format.
Include: preconditions, step-by-step actions, expected result, actual result.
Respond ONLY with the markdown steps directly. Do NOT wrap in JSON.`;
        const result = await this.chat(system, this.buildContext(ctx), 3000);
        const cleaned = result.replace(/^```(?:markdown|md|json)?\s*/i, "").replace(/```\s*$/, "").trim();
        // If the model still returned JSON, extract the steps field
        if (cleaned.startsWith("{")) {
            try { return this.parseJSON<ReproStepsResult>(cleaned); } catch { /* fall through */ }
        }
        return { steps: cleaned };
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

Respond ONLY with the markdown analysis directly. Do NOT wrap in JSON.`;
        const result = await this.chat(system, this.buildContext(ctx), 3000);
        const cleaned = result.replace(/^```(?:markdown|md|json)?\s*/i, "").replace(/```\s*$/, "").trim();
        if (cleaned.startsWith("{")) {
            try { return this.parseJSON<RootCauseResult>(cleaned); } catch { /* fall through */ }
        }
        return { analysis: cleaned };
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

Respond ONLY with the markdown summary directly. Do NOT wrap in JSON.`;
        const result = await this.chat(system, this.buildContext(ctx), 3000);
        const cleaned = result.replace(/^```(?:markdown|md|json)?\s*/i, "").replace(/```\s*$/, "").trim();
        if (cleaned.startsWith("{")) {
            try { return this.parseJSON<LogSummaryResult>(cleaned); } catch { /* fall through */ }
        }
        return { summary: cleaned };
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

Respond ONLY with the markdown suggestion directly. Do NOT wrap in JSON.`;
        const result = await this.chat(system, this.buildContext(ctx), 3000);
        const cleaned = result.replace(/^```(?:markdown|md|json)?\s*/i, "").replace(/```\s*$/, "").trim();
        if (cleaned.startsWith("{")) {
            try { return this.parseJSON<SuggestedFixResult>(cleaned); } catch { /* fall through */ }
        }
        return { suggestion: cleaned };
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

    /* ─── Feature 11: Accessibility Audit ───────────────────────── */

    async auditAccessibility(ctx: ReportContext): Promise<AccessibilityAuditResult> {
        const system = `You are a WCAG accessibility expert. Analyze the bug report data (visual descriptions, transcript, console errors) to identify accessibility issues.

Check for:
- Missing alt text, labels, ARIA attributes
- Color contrast issues
- Keyboard navigation problems
- Screen reader compatibility
- Focus management issues
- Touch target sizes

Rate each issue severity: critical, serious, moderate, minor.
Give an overall accessibility score 0-100.

Respond ONLY with valid JSON:
{
  "issues": [{ "rule": "string (WCAG rule)", "severity": "critical|serious|moderate|minor", "description": "string", "recommendation": "string" }],
  "summary": "string",
  "score": number
}
If no issues found: { "issues": [], "summary": "No accessibility issues detected", "score": 100 }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<AccessibilityAuditResult>(result);
    }

    /* ─── Feature 12: Performance Bottleneck Detection ──────────── */

    async detectPerformanceBottlenecks(ctx: ReportContext): Promise<PerformanceAnalysisResult> {
        const system = `You are a web performance expert. Analyze the bug report data — especially network logs (slow API calls, large payloads, many requests) and console logs (performance warnings) — to identify performance bottlenecks.

Look for:
- Slow API responses (>1s)
- Large payload sizes (>1MB)
- Too many concurrent requests
- Memory leaks or excessive DOM operations
- Render-blocking resources
- N+1 query patterns

Rate each bottleneck impact: high, medium, low.

Respond ONLY with valid JSON:
{
  "bottlenecks": [{ "type": "string", "description": "string", "impact": "high|medium|low", "suggestion": "string" }],
  "summary": "string"
}
If no issues found: { "bottlenecks": [], "summary": "No performance bottlenecks detected" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<PerformanceAnalysisResult>(result);
    }

    /* ─── Feature 13: Security Scan ─────────────────────────────── */

    async scanSecurity(ctx: ReportContext): Promise<SecurityScanResult> {
        const system = `You are a web security expert. Analyze the bug report data — especially console logs and network logs — to identify potential security vulnerabilities.

Look for:
- Exposed API keys, tokens, or credentials in logs
- Insecure HTTP requests (instead of HTTPS)
- CORS misconfigurations
- XSS indicators
- Missing security headers
- Sensitive data in query parameters
- Authentication/authorization issues

Rate each vulnerability: critical, high, medium, low.

Respond ONLY with valid JSON:
{
  "vulnerabilities": [{ "type": "string", "severity": "critical|high|medium|low", "description": "string", "recommendation": "string" }],
  "summary": "string"
}
If no issues found: { "vulnerabilities": [], "summary": "No security vulnerabilities detected" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<SecurityScanResult>(result);
    }

    /* ─── Feature 14: Test Case Generation ──────────────────────── */

    async generateTestCases(ctx: ReportContext): Promise<TestCaseResult> {
        const system = `You are a QA automation engineer. Based on the bug report data, generate comprehensive test cases to verify the bug fix and prevent regression.

Generate:
1. **Bug Verification Test** — Tests that the specific bug is fixed
2. **Regression Tests** — Related tests to ensure nothing else breaks
3. **Edge Cases** — Boundary and edge case tests

Format each test with: Title, Preconditions, Steps, Expected Result.
Write in markdown format suitable for manual or automated testing.

Respond ONLY with the markdown test cases directly. Do NOT wrap in JSON.`;
        const result = await this.chat(system, this.buildContext(ctx), 4000);
        // Raw markdown — strip any accidental fences and return
        const cleaned = result
            .replace(/^```(?:markdown|md)?\s*/i, "")
            .replace(/```\s*$/, "")
            .trim();
        return { testCases: cleaned };
    }

    /* ─── Feature 15: Sentiment & Urgency Detection ─────────────── */

    async detectSentiment(ctx: ReportContext, comments: string[]): Promise<SentimentResult> {
        const system = `You are an emotional intelligence analyst. Analyze the bug report and associated comments to determine the overall sentiment and urgency level.

Sentiment categories:
- frustrated: User is visibly frustrated, angry, or experiencing repeated issues
- neutral: Factual report with no strong emotion
- constructive: User provides helpful details and suggestions

Urgency levels:
- critical: Blocking production, multiple users affected, data loss risk
- high: Important feature broken, deadlines mentioned
- medium: Notable issue but workarounds exist
- low: Minor issue, enhancement request

Respond ONLY with valid JSON: { "sentiment": "frustrated|neutral|constructive", "urgency": "critical|high|medium|low", "reasoning": "string" }`;

        const commentSection = comments.length > 0
            ? `\n\n**Comments:**\n${comments.map((c, i) => `${i + 1}. ${c}`).join("\n")}`
            : "";
        const userPrompt = `${this.buildContext(ctx)}${commentSection}`;
        const result = await this.chat(system, userPrompt);
        return this.parseJSON<SentimentResult>(result);
    }

    /* ─── Feature 16: Auto-Translate Report ─────────────────────── */

    async translateReport(ctx: ReportContext, targetLanguage: string): Promise<TranslationResult> {
        const system = `You are a professional translator. Translate the bug report title and description into ${targetLanguage}.

Guidelines:
- Maintain technical terminology accuracy
- Keep the same tone and level of detail
- Preserve formatting (markdown, code references)
- Translate naturally, not literally

Respond ONLY with valid JSON: { "language": "${targetLanguage}", "title": "translated title", "description": "translated description" }`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<TranslationResult>(result);
    }

    /* ─── Feature 17: Weekly Bug Digest ─────────────────────────── */

    async generateWeeklyDigest(
        reports: Array<{ title: string; severity?: string; tags?: string[]; createdAt: string }>
    ): Promise<WeeklyDigestResult> {
        if (reports.length === 0) {
            return {
                summary: "No bug reports were filed this week.",
                topIssues: [],
                trends: "No data available.",
                recommendations: "No recommendations.",
            };
        }

        const reportList = reports
            .map((r, i) => `${i + 1}. "${r.title}" — Severity: ${r.severity || "unclassified"}, Tags: ${r.tags?.join(", ") || "none"}, Filed: ${r.createdAt}`)
            .join("\n");

        const system = `You are a project manager. Generate a weekly bug digest summarizing the bugs filed this week.

Include:
1. **Summary** — Overview of the week's bugs (count, severity breakdown)
2. **Top Issues** — The most critical/frequent issues with count
3. **Trends** — Any patterns or trends (increasing crashes, recurring auth issues, etc.)
4. **Recommendations** — Action items for the team

Respond ONLY with valid JSON:
{
  "summary": "string",
  "topIssues": [{ "title": "string", "severity": "string", "count": number }],
  "trends": "string",
  "recommendations": "string"
}`;
        const result = await this.chat(system, `**Bug reports this week (${reports.length} total):**\n${reportList}`);
        return this.parseJSON<WeeklyDigestResult>(result);
    }

    /* ─── Feature 18: Smart Assignment ──────────────────────────── */

    async suggestAssignment(
        ctx: ReportContext,
        teamMembers: Array<{ name: string; expertise: string[] }>
    ): Promise<SmartAssignmentResult> {
        const memberList = teamMembers
            .map((m, i) => `${i + 1}. ${m.name} — Expertise: ${m.expertise.join(", ")}`)
            .join("\n");

        const system = `You are a tech lead assigning bugs. Based on the bug report and team expertise, suggest the best team member to handle this bug.

Consider:
- Bug category matching team expertise
- Complexity of the issue
- Required skills

Respond ONLY with valid JSON: { "suggestedAssignee": "name", "reasoning": "string", "requiredSkills": ["string"] }`;

        const userPrompt = `${this.buildContext(ctx)}\n\n**Team Members:**\n${memberList}`;
        const result = await this.chat(system, userPrompt);
        return this.parseJSON<SmartAssignmentResult>(result);
    }

    /* ─── Feature 19: Video Highlight / Bug Moment ──────────────── */

    async identifyBugMoment(ctx: ReportContext, videoDuration: number): Promise<VideoHighlightResult> {
        const system = `You are a QA video analyst. Based on the bug report data (transcript, console logs with timestamps, and description), identify the exact moment in the video where the bug occurs.

The video is ${videoDuration} seconds long.
Provide a start time and end time (in seconds) that captures the bug moment with a small buffer before/after.

Consider:
- Error timestamps in console logs
- Key phrases in the transcript indicating the issue
- Any sudden changes described

Respond ONLY with valid JSON:
{
  "startTime": number (seconds),
  "endTime": number (seconds),
  "description": "what happens at this moment",
  "confidence": "high|medium|low"
}`;
        const result = await this.chat(system, this.buildContext(ctx));
        return this.parseJSON<VideoHighlightResult>(result);
    }

    /* ─── Feature 20: Visual Diff / Compare Reports ─────────────── */

    async compareReports(
        report1: ReportContext,
        report2: ReportContext
    ): Promise<VisualDiffResult> {
        const system = `You are a QA analyst comparing two bug reports. Analyze the differences between them to determine if they describe the same issue, related issues, or completely different bugs.

Compare:
- Symptoms described
- Error messages
- Affected features/areas
- Steps to reproduce
- Console/network log patterns

Respond ONLY with valid JSON:
{
  "differences": [{ "area": "string", "description": "string", "severity": "major|minor|cosmetic" }],
  "summary": "string explaining the relationship between the two reports",
  "overallSimilarity": number (0-100)
}`;

        const userPrompt = `**REPORT 1:**\n${this.buildContext(report1)}\n\n**REPORT 2:**\n${this.buildContext(report2)}`;
        const result = await this.chat(system, userPrompt);
        return this.parseJSON<VisualDiffResult>(result);
    }

    /* ─── Feature 21: Video Chapters ────────────────────────────── */

    async generateChapters(
        ctx: ReportContext,
        videoDuration: number
    ): Promise<{ chapters: { title: string; start: number; end: number }[] }> {
        const system = `You are a QA analyst reviewing a bug report recording. Based on the bug description, console logs, network logs, and video duration, generate logical video chapters that segment the recording into meaningful phases.

Consider typical patterns in bug recordings:
- Setup / Navigation phase
- Trigger action / Reproduction steps  
- Bug manifestation / Error occurrence
- After-effects / Continued behavior

The video is ${videoDuration.toFixed(1)} seconds long.

Respond ONLY with valid JSON:
{
  "chapters": [
    { "title": "string (short, descriptive)", "start": number (seconds), "end": number (seconds) }
  ]
}

Rules:
- Chapters must cover the entire video (first starts at 0, last ends at ${videoDuration.toFixed(1)})
- No gaps or overlaps between chapters
- 3-6 chapters depending on video length
- Titles should be concise (2-5 words)`;

        const result = await this.chat(system, this.buildContext(ctx), 1500);
        return this.parseJSON<{ chapters: { title: string; start: number; end: number }[] }>(result);
    }

    /* ─── Feature 22: Screen OCR ────────────────────────────────── */

    async extractTextFromFrame(context: string): Promise<{ text: string; regions: { text: string; location: string }[] }> {
        const system = `You are an OCR specialist analyzing a bug report. Based on the bug report context and the timestamp in the video, infer what text would likely be visible on screen at this point in the recording.

Consider:
- Error messages / warning dialogs
- UI labels, buttons, navigation items
- Form field values and placeholders
- Console output visible on screen
- Status messages and toasts
- URLs in the address bar

Respond ONLY with valid JSON:
{
  "text": "all likely visible text concatenated with newlines",
  "regions": [
    { "text": "specific text content", "location": "description of where on screen" }
  ]
}`;
        const result = await this.chat(system, context, 2000);
        return this.parseJSON<{ text: string; regions: { text: string; location: string }[] }>(result);
    }
}
