package com.saarthi.service;

import com.saarthi.dao.BookmarkDAO;
import com.saarthi.dao.SchemeDAO;
import com.saarthi.model.Scheme;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/** FR7.x — Bookmarks & Saved Schemes. No SQL, DAOs only. */
public class BookmarkService {

    private final BookmarkDAO bookmarkDAO = new BookmarkDAO();
    private final SchemeDAO schemeDAO = new SchemeDAO();

    /** FR7.1/FR7.2 — returns false if this scheme is already bookmarked by this user (idempotent, not an error). */
    public boolean addBookmark(int userId, int schemeId) throws SQLException {
        if (!schemeDAO.findById(schemeId).isPresent()) {
            return false;
        }
        return bookmarkDAO.insert(userId, schemeId);
    }

    public void removeBookmark(int userId, int schemeId) throws SQLException {
        bookmarkDAO.delete(userId, schemeId);
    }

    /** FR7.3 — bookmarked schemes, dashboard-card format. */
    public List<Scheme> getBookmarkedSchemes(int userId) throws SQLException {
        List<Integer> schemeIds = bookmarkDAO.findSchemeIdsByUserId(userId);
        List<Scheme> schemes = new ArrayList<>();
        for (int schemeId : schemeIds) {
            schemeDAO.findById(schemeId).ifPresent(schemes::add);
        }
        return schemes;
    }
}
