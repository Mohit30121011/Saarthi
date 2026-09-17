package com.saarthi.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Loads chatbot.properties (Gemini/Groq API keys + models + daily message
 * limit). Unlike DBUtil, a missing/unconfigured file is NOT fatal at class-load
 * time — the chatbot is an optional feature (Module 8) and the rest of the
 * platform must keep working if nobody has added keys yet. Callers check
 * isGeminiConfigured()/isGroqConfigured() before using a key.
 */
public final class ChatbotConfig {

    private static final Properties PROPS = new Properties();
    private static volatile boolean LOADED = false;
    private static volatile long lastCheck = 0;

    static {
        reload();
    }

    private ChatbotConfig() {
    }

    public static synchronized void reload() {
        PROPS.clear();
        LOADED = false;

        // 1. Try classloader
        try (InputStream in = ChatbotConfig.class.getClassLoader().getResourceAsStream("chatbot.properties")) {
            if (in != null) {
                PROPS.load(in);
                LOADED = true;
                return;
            }
        } catch (IOException e) {
            System.err.println("ChatbotConfig: failed to load from classloader: " + e.getMessage());
        }

        // 2. Try context classloader
        try {
            ClassLoader ccl = Thread.currentThread().getContextClassLoader();
            if (ccl != null) {
                try (InputStream in = ccl.getResourceAsStream("chatbot.properties")) {
                    if (in != null) {
                        PROPS.load(in);
                        LOADED = true;
                        return;
                    }
                }
            }
        } catch (Exception ignored) {}

        // 3. Try filesystem fallbacks
        String[] fallbackPaths = new String[]{
            "C:\\Users\\Khushi Singh\\Downloads\\apache-tomcat-8.5.99-windows-x64\\apache-tomcat-8.5.99\\webapps\\saarthi\\WEB-INF\\classes\\chatbot.properties",
            "d:\\Saarthi\\Saarthi\\backend\\WebContent\\WEB-INF\\classes\\chatbot.properties",
            "d:\\Saarthi\\Saarthi\\src\\main\\webapp\\WEB-INF\\classes\\chatbot.properties",
            "d:\\Saarthi\\Saarthi\\backend\\src\\chatbot.properties"
        };
        for (String fp : fallbackPaths) {
            java.io.File file = new java.io.File(fp);
            if (file.exists() && file.isFile()) {
                try (InputStream in = new java.io.FileInputStream(file)) {
                    PROPS.load(in);
                    LOADED = true;
                    return;
                } catch (IOException ignored) {}
            }
        }
    }

    private static void ensureFresh() {
        long now = System.currentTimeMillis();
        if (!LOADED || (now - lastCheck > 2000)) {
            lastCheck = now;
            reload();
        }
    }

    // Env vars take priority over chatbot.properties so hosted deployments can
    // inject API keys without baking secrets into the image (see DBUtil for the
    // same pattern).
    private static String getConfig(String envName, String propKey, String fallback) {
        String envValue = System.getenv(envName);
        if (envValue != null && !envValue.isBlank()) {
            return envValue.trim();
        }
        ensureFresh();
        return PROPS.getProperty(propKey, fallback).trim();
    }

    public static String geminiApiKey() { return getConfig("GEMINI_API_KEY", "gemini.api.key", ""); }
    public static String geminiModel() { return getConfig("GEMINI_MODEL", "gemini.model", "gemini-2.5-flash"); }
    public static String groqApiKey() { return getConfig("GROQ_API_KEY", "groq.api.key", ""); }
    public static String groqModel() { return getConfig("GROQ_MODEL", "groq.model", "llama-3.3-70b-versatile"); }

    public static int dailyMessageLimit() {
        try {
            return Integer.parseInt(getConfig("CHAT_DAILY_MESSAGE_LIMIT", "chat.daily.message.limit", "40"));
        } catch (NumberFormatException e) {
            return 40;
        }
    }

    public static boolean isGeminiConfigured() {
        return isRealKey(geminiApiKey());
    }

    public static boolean isGroqConfigured() {
        return isRealKey(groqApiKey());
    }

    public static boolean isAnyProviderConfigured() {
        return isGeminiConfigured() || isGroqConfigured();
    }

    private static boolean isRealKey(String key) {
        return key != null && !key.isBlank() && !key.startsWith("YOUR_");
    }
}
