package com.saarthi.integration;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.saarthi.util.ChatbotConfig;
import com.saarthi.util.JsonUtil;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** Google Gemini (generateContent) — primary chat provider, per chatbot.properties. */
public class GeminiClient implements LlmClient {

    private static final String ENDPOINT_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    private final HttpClient http = HttpClient.newHttpClient();
    private final String apiKey = ChatbotConfig.geminiApiKey();
    private final String model = ChatbotConfig.geminiModel();

    @Override
    public boolean isConfigured() {
        return ChatbotConfig.isGeminiConfigured();
    }

    @Override
    public String name() {
        return "Gemini";
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        JsonObject body = new JsonObject();

        JsonObject systemInstruction = new JsonObject();
        systemInstruction.add("parts", singlePartArray(systemPrompt));
        body.add("systemInstruction", systemInstruction);

        JsonArray contents = new JsonArray();
        JsonObject userContent = new JsonObject();
        userContent.addProperty("role", "user");
        userContent.add("parts", singlePartArray(userPrompt));
        contents.add(userContent);
        body.add("contents", contents);

        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty("responseMimeType", "application/json");
        generationConfig.addProperty("temperature", 0.3);
        body.add("generationConfig", generationConfig);

        String url = String.format(ENDPOINT_TEMPLATE, model);
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .timeout(Duration.ofSeconds(25))
                .POST(HttpRequest.BodyPublishers.ofString(JsonUtil.gson().toJson(body)))
                .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) {
            throw new IOException("Gemini API HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonObject json = JsonUtil.gson().fromJson(response.body(), JsonObject.class);
        return json.getAsJsonArray("candidates").get(0).getAsJsonObject()
                .getAsJsonObject("content").getAsJsonArray("parts").get(0).getAsJsonObject()
                .get("text").getAsString();
    }

    private JsonArray singlePartArray(String text) {
        JsonArray parts = new JsonArray();
        JsonObject part = new JsonObject();
        part.addProperty("text", text);
        parts.add(part);
        return parts;
    }
}
