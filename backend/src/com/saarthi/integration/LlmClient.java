package com.saarthi.integration;

import java.io.IOException;

/** Common contract for the two interchangeable chat model providers (Gemini, Groq). */
public interface LlmClient {

    /** True once a real (non-placeholder) API key is present for this provider. */
    boolean isConfigured();

    /**
     * Sends one turn to the model and returns its raw text reply — expected to be a
     * JSON envelope ({"reply": "...", "referencedSchemeIds": [...]}) per ChatService's
     * system prompt, but this layer does no parsing: that is ChatService's job (Section 5.6).
     */
    String complete(String systemPrompt, String userPrompt) throws IOException, InterruptedException;

    /** Provider name for logging/diagnostics ("Gemini" / "Groq"). */
    String name();
}
