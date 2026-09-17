package com.saarthi.service;

import com.saarthi.dao.BookmarkDAO;
import com.saarthi.dao.NotificationDAO;
import com.saarthi.dao.SchemeDAO;
import com.saarthi.dao.SchemeMatchSnapshotDAO;
import com.saarthi.model.Notification;
import com.saarthi.model.Scheme;
import com.saarthi.model.SchemeMatch;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * FR10.x — Notification Trigger Algorithm (SRS Section 5.5). No SQL, DAOs
 * only. Since this stack has no scheduler/cron dependency, both checks are
 * run opportunistically whenever a citizen's dashboard is computed (profile
 * save, or a match load/refresh) rather than on a background timer.
 */
public class NotificationService {

    private static final long DEADLINE_PROXIMITY_DAYS = 15; // FR10.2

    private final NotificationDAO notificationDAO = new NotificationDAO();
    private final SchemeMatchSnapshotDAO snapshotDAO = new SchemeMatchSnapshotDAO();
    private final BookmarkDAO bookmarkDAO = new BookmarkDAO();
    private final SchemeDAO schemeDAO = new SchemeDAO();

    /** FR10.1/Section 5.5 — diffs the new STRONG set against the stored snapshot; notifies on newly-unlocked schemes. */
    public void runMatchSnapshotDiff(int userId, List<SchemeMatch> currentMatches) throws SQLException {
        Set<Integer> previousStrongIds = snapshotDAO.findStrongSchemeIdsByUserId(userId);

        List<SchemeMatch> strongMatches = currentMatches.stream()
                .filter(m -> m.getConfidence() == SchemeMatch.Confidence.STRONG)
                .collect(Collectors.toList());
        Set<Integer> newStrongIds = new HashSet<>();
        for (SchemeMatch m : strongMatches) {
            newStrongIds.add(m.getScheme().getSchemeId());
        }

        for (SchemeMatch m : strongMatches) {
            int schemeId = m.getScheme().getSchemeId();
            if (!previousStrongIds.contains(schemeId)) {
                Notification n = new Notification();
                n.setUserId(userId);
                n.setSchemeId(schemeId);
                n.setType("NEW_MATCH");
                n.setTitle("New scheme unlocked");
                n.setMessage("You are now a Strong match for \"" + m.getScheme().getName() + "\".");
                notificationDAO.insert(n);
            }
        }

        snapshotDAO.replaceSnapshot(userId, newStrongIds);
    }

    /** FR10.2 — independent of profile changes; checks matched + bookmarked schemes' deadlines. */
    public void checkDeadlineProximity(int userId, List<SchemeMatch> currentMatches) throws SQLException {
        Set<Scheme> candidates = new java.util.LinkedHashSet<>();
        for (SchemeMatch m : currentMatches) {
            candidates.add(m.getScheme());
        }
        for (int bookmarkedSchemeId : bookmarkDAO.findSchemeIdsByUserId(userId)) {
            schemeDAO.findById(bookmarkedSchemeId).ifPresent(candidates::add);
        }

        LocalDate today = LocalDate.now();
        for (Scheme scheme : candidates) {
            if (scheme.getDeadline() == null) continue;
            long daysUntil = ChronoUnit.DAYS.between(today, scheme.getDeadline());
            if (daysUntil < 0 || daysUntil > DEADLINE_PROXIMITY_DAYS) continue;

            if (notificationDAO.existsForUserSchemeType(userId, scheme.getSchemeId(), "DEADLINE_APPROACHING")) {
                continue; // already notified once for this scheme — avoid re-spamming on every dashboard load
            }
            Notification n = new Notification();
            n.setUserId(userId);
            n.setSchemeId(scheme.getSchemeId());
            n.setType("DEADLINE_APPROACHING");
            n.setTitle("Deadline approaching");
            n.setMessage("\"" + scheme.getName() + "\" closes in " + daysUntil + " day(s).");
            notificationDAO.insert(n);
        }
    }

    public List<Notification> getNotifications(int userId) throws SQLException {
        List<Notification> list = notificationDAO.findByUserId(userId);
        if (list.isEmpty()) {
            populateRecentNotifications(userId);
            list = notificationDAO.findByUserId(userId);
        }
        return list;
    }

    private void populateRecentNotifications(int userId) throws SQLException {
        EligibilityService eligibilityService = new EligibilityService();
        List<SchemeMatch> matches = eligibilityService.getPersonalizedMatches(userId);

        // 1. Check statutory deadlines on all matched & bookmarked schemes
        checkDeadlineProximity(userId, matches);

        // 2. Generate new match alerts for top strong matched schemes (up to 4)
        List<SchemeMatch> strongMatches = matches.stream()
                .filter(m -> m.getConfidence() == SchemeMatch.Confidence.STRONG)
                .limit(4)
                .collect(Collectors.toList());

        for (SchemeMatch m : strongMatches) {
            int schemeId = m.getScheme().getSchemeId();
            if (!notificationDAO.existsForUserSchemeType(userId, schemeId, "NEW_MATCH")) {
                Notification n = new Notification();
                n.setUserId(userId);
                n.setSchemeId(schemeId);
                n.setType("NEW_MATCH");
                n.setTitle("New scheme unlocked");
                n.setMessage("You are now a Strong match for \"" + m.getScheme().getName() + "\".");
                notificationDAO.insert(n);
            }
        }

        // 3. Generate a statutory gazette update linked to Maharashtra scholarship
        if (!notificationDAO.existsForUserSchemeType(userId, 18, "STATUTORY_UPDATE")) {
            Notification n = new Notification();
            n.setUserId(userId);
            n.setSchemeId(18);
            n.setType("STATUTORY_UPDATE");
            n.setTitle("Gazette Notification: FY 2026-27 DBT Cycle");
            n.setMessage("Government of Maharashtra gazette notice for higher education scholarship disbursement and verification window.");
            notificationDAO.insert(n);
        }
    }

    public int countUnread(int userId) throws SQLException {
        getNotifications(userId);
        return notificationDAO.countUnread(userId);
    }

    /** FR10.3 */
    public void markRead(int userId, int notificationId) throws SQLException {
        notificationDAO.markRead(userId, notificationId);
    }

    /** FR10.3 */
    public void markAllRead(int userId) throws SQLException {
        notificationDAO.markAllRead(userId);
    }
}
