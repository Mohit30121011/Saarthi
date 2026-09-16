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

/** xAI Grok (OpenAI-compatible chat/completions) — fallback chat provider if Gemini fails. */
public class GrokClient implements LlmClient {

    private static final String ENDPOINT = "https://api.x.ai/v1/chat/completions";

    private final HttpClient http = HttpClient.newHttpClient();
    private final String apiKey = ChatbotConfig.grokApiKey();
    private final String model = ChatbotConfig.grokModel();

    @Override
    public boolean isConfigured() {
        return ChatbotConfig.isGrokConfigured();
    }

    @Override
    public String name() {
        return "Grok";
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        JsonObject body = new JsonObject();
        body.addProperty("model", model);
        body.addProperty("temperature", 0.3);

        JsonObject responseFormat = new JsonObject();
        responseFormat.addProperty("type", "json_object");
        body.add("response_format", responseFormat);

        JsonArray messages = new JsonArray();
        messages.add(message("system", systemPrompt));
        messages.add(message("user", userPrompt));
        body.add("messages", messages);

        HttpRequest request = HttpRequest.newBuilder(URI.create(ENDPOINT))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(25))
                .POST(HttpRequest.BodyPublishers.ofString(JsonUtil.gson().toJson(body)))
                .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) {
            throw new IOException("Grok API HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonObject json = JsonUtil.gson().fromJson(response.body(), JsonObject.class);
        return json.getAsJsonArray("choices").get(0).getAsJsonObject()
                .getAsJsonObject("message").get("content").getAsString();
    }

    private JsonObject message(String role, String content) {
        JsonObject m = new JsonObject();
        m.addProperty("role", role);
        m.addProperty("content", content);
        return m;
    }
}
