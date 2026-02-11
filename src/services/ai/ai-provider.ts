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
