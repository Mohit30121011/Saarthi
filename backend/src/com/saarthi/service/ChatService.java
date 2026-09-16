package com.saarthi.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.saarthi.dao.ChatHistoryDAO;
import com.saarthi.dao.ChatSessionDAO;
import com.saarthi.dao.DocumentDAO;
import com.saarthi.dao.ProfileDAO;
import com.saarthi.dao.SchemeDAO;
import com.saarthi.integration.GeminiClient;
import com.saarthi.integration.GrokClient;
import com.saarthi.integration.LlmClient;
import com.saarthi.model.ChatMessage;
import com.saarthi.model.ChatSession;
import com.saarthi.model.RequiredDocument;
import com.saarthi.model.Scheme;
import com.saarthi.model.SchemeMatch;
import com.saarthi.model.UserProfile;
import com.saarthi.util.ChatbotConfig;
import com.saarthi.util.JsonUtil;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * The AI Chatbot's brain — SRS Section 3.8 (Module 8) / Section 5.6 (Chat Context
 * Assembly & Grounding Algorithm). No SQL here beyond what the existing DAOs already
 * expose; no controller-level HTTP concerns. ChatController only calls handleMessage().
 *
 * Grounding principle (unchanged from the SRS): the model is never asked to recall or
 * invent scheme facts. Every turn: (1) retrieve a small set of verified scheme rows,
 * (2) compute eligibility deterministically via EligibilityService, (3) hand the model
 * only that data plus a hard system prompt, (4) strip any scheme mention the model
 * produces that wasn't actually in the supplied context.
 */
public class ChatService {

    private static final int MAX_CANDIDATE_SCHEMES = 8;
    private static final int MAX_RECENT_TURNS = 6;
    private static final String DISCLAIMER =
            "Eligibility shown here is provisional. Please confirm final eligibility on the scheme's official application portal before applying.";
    private static final String NOT_CONFIGURED_MESSAGE =
            "The Saarthi Assistant isn't set up yet — an administrator needs to add a Gemini or Grok API key to chatbot.properties.";
    private static final Set<String> STOPWORDS = Set.of(
            "the", "a", "an", "is", "am", "are", "was", "were", "for", "and", "or", "to", "of", "in", "on",
            "i", "my", "me", "do", "does", "can", "will", "what", "which", "how", "about", "this", "that",
            "please", "hi", "hello", "hey", "get", "give", "tell", "know", "want", "need"
    );

    private final SchemeDAO schemeDAO = new SchemeDAO();
    private final DocumentDAO documentDAO = new DocumentDAO();
    private final ProfileDAO profileDAO = new ProfileDAO();
    private final EligibilityService eligibilityService = new EligibilityService();
    private final ChatSessionDAO sessionDAO = new ChatSessionDAO();
    private final ChatHistoryDAO historyDAO = new ChatHistoryDAO();
    private final LlmClient gemini = new GeminiClient();
    private final LlmClient grok = new GrokClient();

    public static final class ChatReply {
        public final Integer sessionId;
        public final String reply;
        public final List<SchemeCard> schemes;
        public final boolean limitReached;

        ChatReply(Integer sessionId, String reply, List<SchemeCard> schemes, boolean limitReached) {
            this.sessionId = sessionId;
            this.reply = reply;
            this.schemes = schemes;
            this.limitReached = limitReached;
        }
    }

    public static final class SchemeCard {
        public final int schemeId;
        public final String name;
        public final String ministry;
        public final String categoryName;
        public final String state;
        public final String benefitSummary;
        public final String benefitAmount;
        public final String deadline;
        public final String verifiedAt;
        public final String eligibilityVerdict; // STRONG | PARTIAL | NOT_MATCHED | null (not evaluated this turn)

        SchemeCard(Scheme s, String eligibilityVerdict) {
            this.schemeId = s.getSchemeId();
            this.name = s.getName();
            this.ministry = s.getMinistry();
            this.categoryName = s.getCategoryName();
            this.state = s.getState();
            this.benefitSummary = s.getBenefitSummary();
            this.benefitAmount = s.getBenefitAmount();
            this.deadline = s.getDeadline() == null ? null : s.getDeadline().toString();
            this.verifiedAt = s.getVerifiedAt() == null ? null : s.getVerifiedAt().toString();
            this.eligibilityVerdict = eligibilityVerdict;
        }
    }

    /** FR8.10 — used by ChatController's GET /api/chat/history to resume a prior conversation. */
    public List<ChatMessage> getHistory(int userId) throws SQLException {
        return sessionDAO.findLatestByUser(userId)
                .map(session -> {
                    try {
                        return historyDAO.findBySession(session.getSessionId());
                    } catch (SQLException e) {
                        return List.<ChatMessage>of();
                    }
                })
                .orElseGet(List::of);
    }

    public Integer getLatestSessionId(int userId) throws SQLException {
        return sessionDAO.findLatestByUser(userId).map(ChatSession::getSessionId).orElse(null);
    }

    /**
     * FR8.1-FR8.9 / Section 5.6. userId is the logged-in citizen (chat is behind auth in this
     * release — see RESUME.md for the documented guest-mode scope cut); sessionId lets the
     * client continue an existing conversation instead of starting a new one each message.
     */
    public ChatReply handleMessage(int userId, Integer sessionId, String message) throws SQLException {
        ChatSession session = (sessionId != null)
                ? sessionDAO.findByIdForUser(sessionId, userId).orElseGet(() -> createSessionSafely(userId))
                : sessionDAO.findLatestByUser(userId).orElseGet(() -> createSessionSafely(userId));

        if (!sessionDAO.tryConsumeMessage(session.getSessionId(), ChatbotConfig.dailyMessageLimit())) {
            return new ChatReply(session.getSessionId(),
                    "You've reached today's message limit for the assistant. Please try again tomorrow, or browse the Scheme Explorer in the meantime.",
                    List.of(), true);
        }

        if (!ChatbotConfig.isAnyProviderConfigured()) {
            return new ChatReply(session.getSessionId(), NOT_CONFIGURED_MESSAGE, List.of(), false);
        }

        List<ChatMessage> history = historyDAO.findBySession(session.getSessionId());
        UserProfile profile = profileDAO.findByUserId(userId).orElseGet(UserProfile::new);

        // Section 5.6 Step 1 — retrieve, don't recall.
        List<Scheme> candidates = retrieveCandidates(userId, message);

        // Section 5.6 Step 2 — deterministic eligibility, not model inference (FR8.5).
        Map<Integer, EligibilityService.EligibilityResult> verdictsBySchemeId = new LinkedHashMap<>();
        if (looksLikeEligibilityQuestion(message) && !candidates.isEmpty()) {
            for (EligibilityService.EligibilityResult r : eligibilityService.evaluateCandidates(profile, candidates)) {
                verdictsBySchemeId.put(r.getScheme().getSchemeId(), r);
            }
        }

        // Section 5.6 Step 3 — constrained generation.
        String contextJson = buildContextJson(candidates, verdictsBySchemeId);
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(history, contextJson, message);

        String rawModelReply = callModel(systemPrompt, userPrompt);
        ParsedReply parsed = parseModelReply(rawModelReply);

        // Section 5.6 Step 4 — post-generation verification (FR8.7): only scheme IDs that were
        // actually in this turn's supplied candidate set survive.
        Set<Integer> candidateIds = candidates.stream().map(Scheme::getSchemeId).collect(Collectors.toCollection(LinkedHashSet::new));
        List<Integer> verifiedIds = new ArrayList<>();
        List<String> flagged = new ArrayList<>();
        for (Integer id : parsed.referencedSchemeIds) {
            if (candidateIds.contains(id)) verifiedIds.add(id);
            else flagged.add(String.valueOf(id));
        }

        List<SchemeCard> schemeCards = candidates.stream()
                .filter(s -> verifiedIds.contains(s.getSchemeId()))
                .map(s -> {
                    EligibilityService.EligibilityResult r = verdictsBySchemeId.get(s.getSchemeId());
                    return new SchemeCard(s, r == null ? null : r.getVerdict().name());
                })
                .collect(Collectors.toList());

        String replyText = parsed.reply + "\n\n" + DISCLAIMER;

        historyDAO.insert(session.getSessionId(), "USER", message, null, null);
        historyDAO.insert(session.getSessionId(), "BOT", parsed.reply,
                candidateIds.isEmpty() ? null : String.join(",", candidateIds.stream().map(String::valueOf).collect(Collectors.toList())),
                flagged.isEmpty() ? null : String.join(",", flagged));

        return new ChatReply(session.getSessionId(), replyText, schemeCards, false);
    }

    private ChatSession createSessionSafely(int userId) {
        try {
            return sessionDAO.create(userId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create chat session", e);
        }
    }

    /** Section 5.6 Step 1 — a citizen's current matches first (FR8.2), then a keyword pass over the whole active catalog for anything named that isn't already a match (FR8.3), capped so the prompt stays small. */
    private List<Scheme> retrieveCandidates(int userId, String message) throws SQLException {
        LinkedHashMap<Integer, Scheme> candidates = new LinkedHashMap<>();

        for (SchemeMatch match : eligibilityService.getPersonalizedMatches(userId)) {
            if (candidates.size() >= MAX_CANDIDATE_SCHEMES) break;
            candidates.put(match.getScheme().getSchemeId(), match.getScheme());
        }

        if (candidates.size() < MAX_CANDIDATE_SCHEMES) {
            for (Scheme s : keywordRankedSchemes(message)) {
                if (candidates.size() >= MAX_CANDIDATE_SCHEMES) break;
                candidates.putIfAbsent(s.getSchemeId(), s);
            }
        }
        return new ArrayList<>(candidates.values());
    }

    /** Simple in-memory relevance scoring over the active catalog — no full-text/vector search available in this stack (no Maven), and the catalog is small enough (dozens of rows) that this is cheap. */
    private List<Scheme> keywordRankedSchemes(String message) throws SQLException {
        List<String> words = new ArrayList<>();
        for (String w : message.toLowerCase().split("[^a-z0-9]+")) {
            if (w.length() >= 3 && !STOPWORDS.contains(w)) words.add(w);
        }
        if (words.isEmpty()) return List.of();

        List<Scheme> all = schemeDAO.findAllActive();
        List<Scheme> scored = new ArrayList<>();
        Map<Integer, Integer> scoreBySchemeId = new LinkedHashMap<>();
        for (Scheme s : all) {
            String haystack = (nullToEmpty(s.getName()) + " " + nullToEmpty(s.getDescription()) + " "
                    + nullToEmpty(s.getBenefitSummary()) + " " + nullToEmpty(s.getMinistry())).toLowerCase();
            int score = 0;
            for (String w : words) {
                if (haystack.contains(w)) score++;
            }
            if (score > 0) {
                scored.add(s);
                scoreBySchemeId.put(s.getSchemeId(), score);
            }
        }
        scored.sort(Comparator.comparingInt((Scheme s) -> scoreBySchemeId.get(s.getSchemeId())).reversed());
        return scored;
    }

    private boolean looksLikeEligibilityQuestion(String message) {
        String m = message.toLowerCase();
        return m.contains("eligib") || m.contains("qualify") || m.contains("qualif")
                || m.contains("can i get") || m.contains("am i able") || m.contains("do i get");
    }

    private String buildContextJson(List<Scheme> candidates, Map<Integer, EligibilityService.EligibilityResult> verdicts) throws SQLException {
        JsonArray array = new JsonArray();
        for (Scheme s : candidates) {
            JsonObject obj = new JsonObject();
            obj.addProperty("schemeId", s.getSchemeId());
            obj.addProperty("name", s.getName());
            obj.addProperty("category", s.getCategoryName());
            obj.addProperty("ministry", s.getMinistry());
            obj.addProperty("state", s.getState() == null ? "Central (all of India)" : s.getState());
            obj.addProperty("benefitSummary", s.getBenefitSummary());
            obj.addProperty("benefitAmount", s.getBenefitAmount());
            obj.addProperty("deadline", s.getDeadline() == null ? null : s.getDeadline().toString());
            obj.addProperty("verifiedAt", s.getVerifiedAt() == null ? null : s.getVerifiedAt().toString());
            obj.addProperty("applicationUrl", s.getApplicationUrl());

            List<RequiredDocument> docs = documentDAO.findBySchemeId(s.getSchemeId());
            JsonArray docArray = new JsonArray();
            for (RequiredDocument d : docs) {
                JsonObject docObj = new JsonObject();
                docObj.addProperty("name", d.getDocumentName());
                docObj.addProperty("mandatory", d.isMandatory());
                docArray.add(docObj);
            }
            obj.add("requiredDocuments", docArray);

            EligibilityService.EligibilityResult verdict = verdicts.get(s.getSchemeId());
            if (verdict != null) {
                obj.addProperty("eligibilityVerdictForThisCitizen", verdict.getVerdict().name());
                if (!verdict.getMissingFields().isEmpty()) {
                    obj.addProperty("missingProfileFields", String.join(", ", verdict.getMissingFields()));
                }
            }
            array.add(obj);
        }
        return JsonUtil.gson().toJson(array);
    }

    private String buildSystemPrompt() {
        return "You are Saarthi Assistant, a professional, courteous AI assistant for Saarthi, a platform that helps "
                + "Indian citizens discover government welfare schemes.\n\n"
                + "TONE: warm-professional and concise, like a knowledgeable government-helpline officer. No slang, minimal emoji, no filler.\n\n"
                + "SCOPE — you may answer:\n"
                + "1) Questions about the specific schemes supplied in the candidateSchemes JSON context below (eligibility, benefits, documents, application process, deadlines).\n"
                + "2) Questions about the citizen's own profile, matches, or checklist, using only what is supplied in context.\n"
                + "3) General questions about Indian government civic processes and documents even when not tied to a specific scheme in context (e.g. how to apply for an Aadhaar card, PAN card, ration card, income/caste certificate, or which office handles a given government service).\n\n"
                + "You must politely decline anything outside that scope — general knowledge unrelated to Indian civic/government topics, coding help, medical/legal/financial advice unrelated to schemes, requests for other people's personal data, or casual conversation beyond a brief greeting. When declining, say so directly and redirect the citizen to what Saarthi Assistant can help with.\n\n"
                + "GROUNDING (critical): for any fact about a SPECIFIC scheme (its name, benefit amount, eligibility rule, deadline, or required documents), you must answer only from candidateSchemes in the context JSON. Never invent or recall a scheme fact from general knowledge. If a citizen asks about a scheme not present in candidateSchemes, say plainly: \"I don't have verified information on that scheme in this conversation — try searching for it in the Scheme Explorer.\" Never guess.\n\n"
                + "ELIGIBILITY: if a scheme in context has \"eligibilityVerdictForThisCitizen\", use that exact value (STRONG = they qualify, PARTIAL = they may qualify but some profile fields are missing — list missingProfileFields if present, NOT_MATCHED = they do not qualify) to phrase your answer. Never compute or guess eligibility yourself.\n\n"
                + "OUTPUT FORMAT: respond with ONLY a single JSON object and nothing else — no markdown code fences, no text before or after it:\n"
                + "{\"reply\": \"your plain-language answer as a string, using \\n for paragraph breaks\", \"referencedSchemeIds\": [array of schemeId numbers from candidateSchemes that your reply substantively discusses]}\n"
                + "Only include a schemeId in referencedSchemeIds if you actually discuss that scheme's facts in your reply — do not list schemes you didn't mention.";
    }

    private String buildUserPrompt(List<ChatMessage> history, String contextJson, String newMessage) {
        StringBuilder sb = new StringBuilder();
        if (!history.isEmpty()) {
            sb.append("Recent conversation so far:\n");
            int start = Math.max(0, history.size() - MAX_RECENT_TURNS);
            for (ChatMessage m : history.subList(start, history.size())) {
                sb.append("USER".equals(m.getSender()) ? "Citizen: " : "Assistant: ").append(m.getMessage()).append("\n");
            }
            sb.append("\n");
        }
        sb.append("candidateSchemes (verified data — the ONLY schemes you may state facts about):\n");
        sb.append(contextJson).append("\n\n");
        sb.append("Citizen's new message: ").append(newMessage);
        return sb.toString();
    }

    private String callModel(String systemPrompt, String userPrompt) {
        if (gemini.isConfigured()) {
            try {
                return gemini.complete(systemPrompt, userPrompt);
            } catch (Exception e) {
                System.err.println("ChatService: Gemini call failed, falling back to Grok: " + e.getMessage());
            }
        }
        if (grok.isConfigured()) {
            try {
                return grok.complete(systemPrompt, userPrompt);
            } catch (Exception e) {
                System.err.println("ChatService: Grok call failed: " + e.getMessage());
            }
        }
        return null;
    }

    private static final class ParsedReply {
        final String reply;
        final List<Integer> referencedSchemeIds;

        ParsedReply(String reply, List<Integer> referencedSchemeIds) {
            this.reply = reply;
            this.referencedSchemeIds = referencedSchemeIds;
        }
    }

    /** Defensive parsing — the model is instructed to return clean JSON, but never trust an external LLM's output blindly. */
    private ParsedReply parseModelReply(String raw) {
        if (raw == null || raw.isBlank()) {
            return new ParsedReply("I'm having trouble reaching the assistant service right now. Please try again in a moment.", List.of());
        }
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```\\s*$", "").trim();
        }
        try {
            JsonObject obj = JsonParser.parseString(cleaned).getAsJsonObject();
            String reply = obj.has("reply") && !obj.get("reply").isJsonNull() ? obj.get("reply").getAsString() : cleaned;
            List<Integer> ids = new ArrayList<>();
            if (obj.has("referencedSchemeIds") && obj.get("referencedSchemeIds").isJsonArray()) {
                for (var el : obj.getAsJsonArray("referencedSchemeIds")) {
                    try {
                        ids.add(el.getAsInt());
                    } catch (Exception ignored) {
                        // non-numeric entry — skip rather than fail the whole reply
                    }
                }
            }
            return new ParsedReply(reply, ids);
        } catch (Exception e) {
            // Model didn't return valid JSON — degrade gracefully to plain text, no scheme cards.
            return new ParsedReply(cleaned, List.of());
        }
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
