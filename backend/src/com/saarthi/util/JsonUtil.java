package com.saarthi.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/** Thin Gson wrapper — Controllers use this to write JSON, never construct it by hand. */
public final class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(java.time.LocalDateTime.class, (com.google.gson.JsonSerializer<java.time.LocalDateTime>) 
                (src, typeOfSrc, context) -> src == null ? com.google.gson.JsonNull.INSTANCE : new com.google.gson.JsonPrimitive(src.toString()))
            .registerTypeAdapter(java.time.LocalDateTime.class, (com.google.gson.JsonDeserializer<java.time.LocalDateTime>) 
                (json, typeOfT, context) -> json == null || json.isJsonNull() ? null : java.time.LocalDateTime.parse(json.getAsString()))
            .registerTypeAdapter(java.time.LocalDate.class, (com.google.gson.JsonSerializer<java.time.LocalDate>) 
                (src, typeOfSrc, context) -> src == null ? com.google.gson.JsonNull.INSTANCE : new com.google.gson.JsonPrimitive(src.toString()))
            .registerTypeAdapter(java.time.LocalDate.class, (com.google.gson.JsonDeserializer<java.time.LocalDate>) 
                (json, typeOfT, context) -> json == null || json.isJsonNull() ? null : java.time.LocalDate.parse(json.getAsString()))
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            .create();

    private JsonUtil() {
    }

    public static Gson gson() {
        return GSON;
    }

    public static void writeJson(HttpServletResponse resp, int statusCode, Object body) throws IOException {
        resp.setStatus(statusCode);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(GSON.toJson(body));
    }

    public static void writeError(HttpServletResponse resp, int statusCode, String message) throws IOException {
        writeJson(resp, statusCode, new ErrorBody(message));
    }

    public static final class ErrorBody {
        public final String error;

        public ErrorBody(String error) {
            this.error = error;
        }
    }
}
