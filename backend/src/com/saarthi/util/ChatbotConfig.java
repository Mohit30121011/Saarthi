package com.saarthi.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Loads chatbot.properties (Gemini/Grok API keys + models + daily message
 * limit). Unlike DBUtil, a missing/unconfigured file is NOT fatal at class-load
 * time — the chatbot is an optional feature (Module 8) and the rest of the
 * platform must keep working if nobody has added keys yet. Callers check
 * isGeminiConfigured()/isGrokConfigured() before using a key.
 */
public final class ChatbotConfig {

    private static final Properties PROPS = new Properties();
    private static final boolean LOADED;

    static {
        boolean loaded = false;
        try (InputStream in = ChatbotConfig.class.getClassLoader().getResourceAsStream("chatbot.properties")) {
            if (in != null) {
                PROPS.load(in);
                loaded = true;
            }
        } catch (IOException e) {
            // treated as "not configured" — logged, not thrown
            System.err.println("ChatbotConfig: failed to load chatbot.properties: " + e.getMessage());
        }
        LOADED = loaded;
    }

    private ChatbotConfig() {
    }

    public static String geminiApiKey() { return PROPS.getProperty("gemini.api.key", ""); }
    public static String geminiModel() { return PROPS.getProperty("gemini.model", "gemini-2.0-flash"); }
    public static String grokApiKey() { return PROPS.getProperty("grok.api.key", ""); }
    public static String grokModel() { return PROPS.getProperty("grok.model", "grok-4"); }

    public static int dailyMessageLimit() {
        try {
            return Integer.parseInt(PROPS.getProperty("chat.daily.message.limit", "40").trim());
        } catch (NumberFormatException e) {
            return 40;
        }
    }

    public static boolean isGeminiConfigured() { return isRealKey(geminiApiKey()); }
    public static boolean isGrokConfigured() { return isRealKey(grokApiKey()); }
    public static boolean isAnyProviderConfigured() { return isGeminiConfigured() || isGrokConfigured(); }

    private static boolean isRealKey(String key) {
        return LOADED && key != null && !key.isBlank() && !key.startsWith("YOUR_");
    }
}
