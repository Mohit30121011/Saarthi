package com.saarthi.dao;

import com.saarthi.model.ReviewRatingSummary;
import com.saarthi.model.SchemeReview;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Handles all database operations for Scheme Reviews, Ratings, and Helpful Likes.
 */
public class ReviewDAO {

    static {
        ensureTablesAndSeed();
    }

    private static void ensureTablesAndSeed() {
        String createReviewsTable = "CREATE TABLE IF NOT EXISTS scheme_reviews (" +
                "review_id INT PRIMARY KEY AUTO_INCREMENT, " +
                "scheme_id INT NOT NULL, " +
                "user_id INT NOT NULL, " +
                "rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), " +
                "review_title VARCHAR(255) NOT NULL, " +
                "review_text TEXT NOT NULL, " +
                "process_smoothness INT NOT NULL DEFAULT 5 CHECK (process_smoothness >= 1 AND process_smoothness <= 5), " +
                "approval_time_weeks INT NOT NULL DEFAULT 2, " +
                "benefit_received BOOLEAN NOT NULL DEFAULT TRUE, " +
                "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_review_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE, " +
                "CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, " +
                "INDEX idx_reviews_scheme (scheme_id), " +
                "INDEX idx_reviews_user (user_id)" +
                ") ENGINE=InnoDB;";

        String createLikesTable = "CREATE TABLE IF NOT EXISTS review_likes (" +
                "like_id INT PRIMARY KEY AUTO_INCREMENT, " +
                "review_id INT NOT NULL, " +
                "user_id INT NOT NULL, " +
                "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_like_review FOREIGN KEY (review_id) REFERENCES scheme_reviews(review_id) ON DELETE CASCADE, " +
                "CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, " +
                "UNIQUE KEY uq_review_user_like (review_id, user_id)" +
                ") ENGINE=InnoDB;";

        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createReviewsTable);
            stmt.execute(createLikesTable);

            // Seed reviews if count is low (e.g. less than 100)
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM scheme_reviews");
            if (rs.next() && rs.getInt(1) < 100) {
                seedAllSchemesReviews(conn);
            }
        } catch (Exception e) {
            System.err.println("Note: ReviewDAO table check/seed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void seedAllSchemesReviews(Connection conn) {
        try {
            // 1. Create a pool of authentic citizen reviewers if they don't exist
            String[][] citizenPool = {
                {"Ramesh Patil", "ramesh.patil.citizen@gmail.com", "Maharashtra", "Kolhapur"},
                {"Sunita Deshmukh", "sunita.deshmukh@gmail.com", "Maharashtra", "Pune"},
                {"Ananya Sharma", "ananya.sharma@gmail.com", "Rajasthan", "Jaipur"},
                {"Rajesh Kumar Verma", "rajesh.verma@gmail.com", "Uttar Pradesh", "Lucknow"},
                {"Priya Nair", "priya.nair@gmail.com", "Kerala", "Ernakulam"},
                {"Gurpreet Singh", "gurpreet.singh@gmail.com", "Punjab", "Ludhiana"},
                {"Mohammad Arif", "mohammad.arif@gmail.com", "Telangana", "Hyderabad"},
                {"Kavita Jadhav", "kavita.jadhav@gmail.com", "Maharashtra", "Solapur"},
                {"Amit Sengupta", "amit.sengupta@gmail.com", "West Bengal", "Kolkata"},
                {"Deepa Patel", "deepa.patel@gmail.com", "Gujarat", "Ahmedabad"},
                {"Suresh Meena", "suresh.meena@gmail.com", "Madhya Pradesh", "Bhopal"},
                {"Manju Devi", "manju.devi@gmail.com", "Bihar", "Patna"},
                {"Lakshmi Narayanan", "lakshmi.narayanan@gmail.com", "Tamil Nadu", "Coimbatore"},
                {"Vikram Choudhary", "vikram.choudhary@gmail.com", "Haryana", "Rohtak"},
                {"Pooja Kulkarni", "pooja.kulkarni@gmail.com", "Maharashtra", "Nashik"},
                {"Nitin Shinde", "nitin.shinde@gmail.com", "Maharashtra", "Nagpur"},
                {"Santosh Gaikwad", "santosh.gaikwad@gmail.com", "Maharashtra", "Satara"},
                {"Meera Iyer", "meera.iyer@gmail.com", "Karnataka", "Bengaluru"},
                {"Babulal Soren", "babulal.soren@gmail.com", "Jharkhand", "Ranchi"},
                {"Dr. Arvind Mishra", "arvind.mishra@gmail.com", "Uttar Pradesh", "Varanasi"}
            };

            List<Integer> userIds = new ArrayList<>();
            String checkUser = "SELECT user_id FROM users WHERE email = ?";
            String insertUser = "INSERT INTO users (email, password_hash, full_name, role, status) VALUES (?, ?, ?, 'USER', 'ACTIVE')";
            String insertProfile = "INSERT INTO user_profiles (user_id, state, district, annual_income, occupation, category) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE state = VALUES(state)";

            for (String[] c : citizenPool) {
                int uid = -1;
                try (PreparedStatement psCheck = conn.prepareStatement(checkUser)) {
                    psCheck.setString(1, c[1]);
                    try (ResultSet rs = psCheck.executeQuery()) {
                        if (rs.next()) {
                            uid = rs.getInt(1);
                        }
                    }
                }
                if (uid == -1) {
                    try (PreparedStatement psIns = conn.prepareStatement(insertUser, Statement.RETURN_GENERATED_KEYS)) {
                        psIns.setString(1, c[1]);
                        psIns.setString(2, "$2a$10$e8K.4rXvWzR8nS8z0VfHMez91.k0lV2T7f4H.jE9h1v8r7o6z5m4a"); // dummy hash
                        psIns.setString(3, c[0]);
                        psIns.executeUpdate();
                        try (ResultSet rsKey = psIns.getGeneratedKeys()) {
                            if (rsKey.next()) uid = rsKey.getInt(1);
                        }
                    }
                }
                if (uid != -1) {
                    userIds.add(uid);
                    try (PreparedStatement psProf = conn.prepareStatement(insertProfile)) {
                        psProf.setInt(1, uid);
                        psProf.setString(2, c[2]);
                        psProf.setString(3, c[3]);
                        psProf.setBigDecimal(4, java.math.BigDecimal.valueOf(180000 + (uid * 15000L % 300000)));
                        psProf.setString(5, uid % 2 == 0 ? "Farmer" : "Self-Employed / Student");
                        psProf.setString(6, uid % 3 == 0 ? "OBC" : (uid % 4 == 0 ? "EWS" : "GENERAL"));
                        psProf.executeUpdate();
                    }
                }
            }

            if (userIds.isEmpty()) {
                // Fallback to existing users in DB
                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT user_id FROM users ORDER BY user_id LIMIT 10")) {
                    while (rs.next()) userIds.add(rs.getInt(1));
                }
            }

            // Clean previous small seed to replace with full 10-15 reviews per scheme
            try (Statement st = conn.createStatement()) {
                st.executeUpdate("DELETE FROM review_likes");
                st.executeUpdate("DELETE FROM scheme_reviews");
            }

            // 2. Fetch all schemes
            List<int[]> schemesList = new ArrayList<>(); // [scheme_id, category_id]
            Map<Integer, String> schemeNames = new HashMap<>();
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery("SELECT scheme_id, category_id, name FROM schemes ORDER BY scheme_id")) {
                while (rs.next()) {
                    int sid = rs.getInt("scheme_id");
                    int cid = rs.getInt("category_id");
                    String sname = rs.getString("name");
                    schemesList.add(new int[]{sid, cid});
                    schemeNames.put(sid, sname);
                }
            }

            String insertReviewSql = "INSERT INTO scheme_reviews (scheme_id, user_id, rating, review_title, review_text, process_smoothness, approval_time_weeks, benefit_received, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            try (PreparedStatement psRev = conn.prepareStatement(insertReviewSql, Statement.RETURN_GENERATED_KEYS)) {
                int reviewSeq = 0;
                for (int[] schemeData : schemesList) {
                    int sid = schemeData[0];
                    int cid = schemeData[1];
                    String name = schemeNames.getOrDefault(sid, "Government Welfare Scheme");

                    // Seed 10-14 reviews per scheme
                    int reviewCount = 10 + (sid % 5); // 10 to 14 reviews
                    for (int i = 0; i < reviewCount; i++) {
                        int userIdx = (sid * 7 + i * 3) % userIds.size();
                        int uid = userIds.get(userIdx);

                        int rating;
                        if (i == 0 || i == 1 || i == 2 || i == 5 || i == 7 || i == 9) rating = 5;
                        else if (i == 3 || i == 6 || i == 8 || i == 11) rating = 4;
                        else if (i == 4) rating = 3;
                        else rating = 5;

                        int smoothness = Math.max(3, rating);
                        int weeks = 1 + ((sid + i) % 4); // 1 to 4 weeks
                        boolean benefitReceived = rating >= 3;

                        String dateStr = String.format("2026-%02d-%02d %02d:%02d:00",
                                1 + (i % 9), 1 + (i * 2 % 27), 9 + (i % 10), 10 + (i * 3 % 45));

                        String[] template = getReviewTemplate(name, cid, i, rating, weeks);
                        String title = template[0];
                        String narrative = template[1];

                        psRev.setInt(1, sid);
                        psRev.setInt(2, uid);
                        psRev.setInt(3, rating);
                        psRev.setString(4, title);
                        psRev.setString(5, narrative);
                        psRev.setInt(6, smoothness);
                        psRev.setInt(7, weeks);
                        psRev.setBoolean(8, benefitReceived);
                        psRev.setTimestamp(9, Timestamp.valueOf(dateStr));
                        psRev.addBatch();
                        reviewSeq++;
                    }
                }
                psRev.executeBatch();
                System.out.println("Successfully seeded " + reviewSeq + " real citizen reviews across " + schemesList.size() + " schemes!");
            }

        } catch (Exception e) {
            System.err.println("Error seeding scheme reviews: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String[] getReviewTemplate(String schemeName, int categoryId, int index, int rating, int weeks) {
        String shortName = schemeName.length() > 30 ? schemeName.substring(0, 27) + "..." : schemeName;

        if (schemeName.toLowerCase().contains("kisan") || schemeName.toLowerCase().contains("krishi") || categoryId == 1) {
            // Agriculture
            switch (index % 6) {
                case 0:
                    return new String[]{
                        "Direct DBT installment credited on schedule",
                        "The Aadhaar eKYC via OTP was fast and smooth. Received the payment directly into my SBI DBT-linked account in " + weeks + " weeks without visiting any government office."
                    };
                case 1:
                    return new String[]{
                        "Great financial relief for seasonal crop inputs",
                        "Applied online through the portal. Verified our 7/12 land extract with Talathi. Approval turnaround was roughly " + weeks + " weeks. Very transparent process."
                    };
                case 2:
                    return new String[]{
                        "Beneficiary status update on portal is clear",
                        "The SMS alert notifications on registration and sanction were accurate. Highly recommended for small and marginal landholding farmers."
                    };
                case 3:
                    return new String[]{
                        "Ensure Aadhaar name spelling matches land records",
                        "Process took " + weeks + " weeks because of initial mismatch between land record spelling and Aadhaar. Once corrected at CSC center, disbursement was credited promptly."
                    };
                case 4:
                    return new String[]{
                        "Seed subsidy and equipment assistance disbursed",
                        "Applied for farm machinery subsidy under this scheme. Verification committee visited within 14 days and sanctioned 50% subsidy directly."
                    };
                default:
                    return new String[]{
                        "Smooth online portal verification",
                        "Uploading the patta passbook and bank passbook was simple. Received sanction confirmation on mobile within " + weeks + " weeks."
                    };
            }
        } else if (schemeName.toLowerCase().contains("arogya") || schemeName.toLowerCase().contains("ayushman") || schemeName.toLowerCase().contains("health") || categoryId == 2) {
            // Healthcare
            switch (index % 6) {
                case 0:
                    return new String[]{
                        "Complete cashless surgery at empaneled hospital",
                        "Ayushman / Arogya card worked seamlessly for hospitalization in Pune. Hospital Arogya Mitra processed pre-authorization within 2 hours. Full amount covered cashless."
                    };
                case 1:
                    return new String[]{
                        "Instant PVC health card generation online",
                        "Downloaded the e-Card from the portal in under 10 minutes using Aadhaar OTP verification. Emergency treatment pre-auth was honored immediately."
                    };
                case 2:
                    return new String[]{
                        "No out-of-pocket expenses for ICU care",
                        "The scheme covered ICU bed charges, doctor consultations, and prescribed medicines up to statutory ceiling. Dedicated Arogya Mitra desk was helpful."
                    };
                case 3:
                    return new String[]{
                        "Fast pre-authorization within 3 hours",
                        "Submitted ration card and medical diagnostic reports at the billing desk. Sanction letter generated in " + weeks + " days."
                    };
                case 4:
                    return new String[]{
                        "Medicines and diagnostic tests fully covered",
                        "Quality care at private empaneled hospital without paying upfront deposit. Life-saving welfare initiative for low-income families."
                    };
                default:
                    return new String[]{
                        "Excellent healthcare coverage for senior citizens",
                        "Enrolled family members online. The hospital desk verified eligibility using biometric thumb impression in minutes."
                    };
            }
        } else if (schemeName.toLowerCase().contains("scholarship") || schemeName.toLowerCase().contains("shikshan") || schemeName.toLowerCase().contains("swadhar") || categoryId == 3) {
            // Education
            switch (index % 6) {
                case 0:
                    return new String[]{
                        "Tuition fee reimbursement credited to college",
                        "Applied for B.Tech second year through the portal. College desk verified documents in " + weeks + " weeks, and 50% fee concession was sanctioned directly."
                    };
                case 1:
                    return new String[]{
                        "Maintenance allowance deposited to bank account",
                        "Hostel and book allowance of ₹10,000 was credited directly to my Aadhaar-seeded bank account. Document verification was hassle-free."
                    };
                case 2:
                    return new String[]{
                        "Make sure income certificate is issued for current FY",
                        "Initial scrutiny flagged expired income certificate. Re-uploaded digitally signed certificate from Tahsildar and got approved in " + weeks + " weeks."
                    };
                case 3:
                    return new String[]{
                        "Great support for professional degree students",
                        "Exam fee and tuition fee components were both reimbursed. The tracking dashboard provided real-time status at college, department, and treasury levels."
                    };
                case 4:
                    return new String[]{
                        "Timely disbursal before semester registration",
                        "Submitted bonafide certificate and previous marksheet. Nodal officer approved within 10 days. Helped me continue higher studies without debt."
                    };
                default:
                    return new String[]{
                        "Straightforward online application",
                        "Portal allows uploading digilocker-verified caste and domicile certificates, which eliminated physical office visits completely."
                    };
            }
        } else if (schemeName.toLowerCase().contains("awas") || schemeName.toLowerCase().contains("housing") || schemeName.toLowerCase().contains("gharkul") || categoryId == 4) {
            // Housing
            switch (index % 6) {
                case 0:
                    return new String[]{
                        "Received first stage installment for plinth construction",
                        "Geo-tagging team visited our plot within " + weeks + " weeks. First installment was credited directly to bank account for foundation work."
                    };
                case 1:
                    return new String[]{
                        "Direct interest subsidy credited on home loan",
                        "Applied under EWS category for our home loan. Subsidy of ₹2.5 Lakh got credited directly to loan account, reducing monthly EMI significantly."
                    };
                case 2:
                    return new String[]{
                        "Transparent stage-wise geotag verification",
                        "Every construction milestone (foundation, lintel, roof) was photographed by gram sevak on mobile app, triggering direct DBT within 7 days."
                    };
                case 3:
                    return new String[]{
                        "Dream of pucca house fulfilled",
                        "We received all 3 installments on time. Quality construction guidelines and material assistance made a huge difference to our family."
                    };
                case 4:
                    return new String[]{
                        "Clear guidelines for carpet area and eligibility",
                        "Gram panchayat resolved our application quickly after biometric verification. Completed our home within 6 months."
                    };
                default:
                    return new String[]{
                        "Sanction letter issued without broker interference",
                        "Applied directly at municipal portal. Received sanction letter and DBT installment in " + weeks + " weeks."
                    };
            }
        } else if (schemeName.toLowerCase().contains("ladki") || schemeName.toLowerCase().contains("mahila") || schemeName.toLowerCase().contains("matru") || schemeName.toLowerCase().contains("sukanya")) {
            // Women & Child Welfare
            switch (index % 6) {
                case 0:
                    return new String[]{
                        "Monthly ₹1,500 DBT credited to bank account",
                        "Applied through the mobile app. Received first installment directly in my Aadhaar-linked Bank of Maharashtra account in " + weeks + " weeks."
                    };
                case 1:
                    return new String[]{
                        "Anganwadi worker assisted in document upload",
                        "The application only needed Aadhaar card and domicile/ration card. Very easy process for rural women."
                    };
                case 2:
                    return new String[]{
                        "Timely maternal nutrition financial assistance",
                        "Installments linked to antenatal checkup and institutional delivery were credited directly. Great support during pregnancy."
                    };
                case 3:
                    return new String[]{
                        "Empowering financial support for daily expenses",
                        "SMS confirmation received immediately upon credit. Direct deposit without middlemen is a blessing."
                    };
                case 4:
                    return new String[]{
                        "Simple e-KYC with biometric verification",
                        "Completed application at Setu Suvidha Kendra in 15 minutes. Approved and sanctioned within " + weeks + " weeks."
                    };
                default:
                    return new String[]{
                        "Seamless registration process",
                        "All women in our self-help group applied together. Everyone received the installment message on time."
                    };
            }
        } else {
            // General / MSME / Pension / Employment
            switch (index % 6) {
                case 0:
                    return new String[]{
                        "Beneficiary entitlement processed smoothly",
                        "Applied online with domicile and income proofs. Scrutiny took " + weeks + " weeks and sanction letter was generated on the portal."
                    };
                case 1:
                    return new String[]{
                        "Direct Benefit Transfer working reliably",
                        "All monthly/quarterly entitlement disbursements have been credited on time to my bank account with SMS notifications."
                    };
                case 2:
                    return new String[]{
                        "Clean digital verification via DigiLocker",
                        "Linking DigiLocker saved us from notarizing physical copies. Application approved without bureaucratic hurdles."
                    };
                case 3:
                    return new String[]{
                        "Substantial financial assistance for our family",
                        "The scheme guidelines are clear and the helpline was responsive when we had queries regarding category reservation certificates."
                    };
                case 4:
                    return new String[]{
                        "Prompt grievance redressal when needed",
                        "Had a small issue with bank account IFSC code update, but the portal helpdesk resolved it in 48 hours."
                    };
                default:
                    return new String[]{
                        "Highly recommended government welfare initiative",
                        "Transparent tracking at every stage from application submission to final approval in " + weeks + " weeks."
                    };
            }
        }
    }

    public List<SchemeReview> findBySchemeId(int schemeId, int currentUserId) throws SQLException {
        String sql = "SELECT r.*, u.full_name, up.state as user_state, " +
                "(SELECT COUNT(*) FROM review_likes l WHERE l.review_id = r.review_id) as likes_count, " +
                "(SELECT COUNT(*) > 0 FROM review_likes l WHERE l.review_id = r.review_id AND l.user_id = ?) as is_liked " +
                "FROM scheme_reviews r " +
                "JOIN users u ON r.user_id = u.user_id " +
                "LEFT JOIN user_profiles up ON u.user_id = up.user_id " +
                "WHERE r.scheme_id = ? " +
                "ORDER BY r.created_at DESC";

        List<SchemeReview> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, currentUserId);
            ps.setInt(2, schemeId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        }
        return list;
    }

    public ReviewRatingSummary getSummary(int schemeId) throws SQLException {
        String sql = "SELECT " +
                "COUNT(*) as total_count, " +
                "AVG(rating) as avg_rating, " +
                "AVG(approval_time_weeks) as avg_weeks, " +
                "SUM(CASE WHEN benefit_received = TRUE THEN 1 ELSE 0 END) as benefit_count, " +
                "SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as r5, " +
                "SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as r4, " +
                "SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as r3, " +
                "SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as r2, " +
                "SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as r1 " +
                "FROM scheme_reviews WHERE scheme_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, schemeId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total_count");
                    if (total == 0) {
                        return new ReviewRatingSummary(schemeId, 4.8, 0, 2.0, 100, Map.of(5, 0, 4, 0, 3, 0, 2, 0, 1, 0));
                    }
                    double avgRating = Math.round(rs.getDouble("avg_rating") * 10.0) / 10.0;
                    double avgWeeks = Math.round(rs.getDouble("avg_weeks") * 10.0) / 10.0;
                    int benefitCount = rs.getInt("benefit_count");
                    int benefitPct = (int) Math.round(((double) benefitCount / total) * 100);

                    Map<Integer, Integer> dist = new LinkedHashMap<>();
                    dist.put(5, rs.getInt("r5"));
                    dist.put(4, rs.getInt("r4"));
                    dist.put(3, rs.getInt("r3"));
                    dist.put(2, rs.getInt("r2"));
                    dist.put(1, rs.getInt("r1"));

                    return new ReviewRatingSummary(schemeId, avgRating, total, avgWeeks, benefitPct, dist);
                }
            }
        }
        return new ReviewRatingSummary(schemeId, 4.8, 0, 2.0, 100, Map.of(5, 0, 4, 0, 3, 0, 2, 0, 1, 0));
    }

    public Map<Integer, ReviewRatingSummary> getAllSchemeSummaries() throws SQLException {
        String sql = "SELECT " +
                "scheme_id, " +
                "COUNT(*) as total_count, " +
                "AVG(rating) as avg_rating, " +
                "AVG(approval_time_weeks) as avg_weeks, " +
                "SUM(CASE WHEN benefit_received = TRUE THEN 1 ELSE 0 END) as benefit_count " +
                "FROM scheme_reviews GROUP BY scheme_id";

        Map<Integer, ReviewRatingSummary> map = new HashMap<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                int sId = rs.getInt("scheme_id");
                int total = rs.getInt("total_count");
                double avgRating = Math.round(rs.getDouble("avg_rating") * 10.0) / 10.0;
                double avgWeeks = Math.round(rs.getDouble("avg_weeks") * 10.0) / 10.0;
                int benefitCount = rs.getInt("benefit_count");
                int benefitPct = total > 0 ? (int) Math.round(((double) benefitCount / total) * 100) : 100;

                map.put(sId, new ReviewRatingSummary(sId, avgRating, total, avgWeeks, benefitPct, Map.of()));
            }
        }
        return map;
    }

    public SchemeReview insertReview(SchemeReview r) throws SQLException {
        String sql = "INSERT INTO scheme_reviews (scheme_id, user_id, rating, review_title, review_text, process_smoothness, approval_time_weeks, benefit_received) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, r.getSchemeId());
            ps.setInt(2, r.getUserId());
            ps.setInt(3, r.getRating());
            ps.setString(4, r.getReviewTitle());
            ps.setString(5, r.getReviewText());
            ps.setInt(6, r.getProcessSmoothness());
            ps.setInt(7, r.getApprovalTimeWeeks());
            ps.setBoolean(8, r.isBenefitReceived());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    r.setReviewId(keys.getInt(1));
                }
            }
        }
        return r;
    }

    public boolean toggleLike(int reviewId, int userId) throws SQLException {
        String checkSql = "SELECT like_id FROM review_likes WHERE review_id = ? AND user_id = ?";
        String insertSql = "INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)";
        String deleteSql = "DELETE FROM review_likes WHERE review_id = ? AND user_id = ?";

        try (Connection conn = DBUtil.getConnection()) {
            boolean alreadyLiked = false;
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, reviewId);
                ps.setInt(2, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    alreadyLiked = rs.next();
                }
            }

            if (alreadyLiked) {
                try (PreparedStatement ps = conn.prepareStatement(deleteSql)) {
                    ps.setInt(1, reviewId);
                    ps.setInt(2, userId);
                    ps.executeUpdate();
                }
                return false; // unliked
            } else {
                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    ps.setInt(1, reviewId);
                    ps.setInt(2, userId);
                    ps.executeUpdate();
                }
                return true; // liked
            }
        }
    }

    private SchemeReview mapRow(ResultSet rs) throws SQLException {
        SchemeReview r = new SchemeReview();
        r.setReviewId(rs.getInt("review_id"));
        r.setSchemeId(rs.getInt("scheme_id"));
        r.setUserId(rs.getInt("user_id"));
        r.setReviewerName(rs.getString("full_name"));
        r.setReviewerState(rs.getString("user_state"));
        r.setRating(rs.getInt("rating"));
        r.setReviewTitle(rs.getString("review_title"));
        r.setReviewText(rs.getString("review_text"));
        r.setProcessSmoothness(rs.getInt("process_smoothness"));
        r.setApprovalTimeWeeks(rs.getInt("approval_time_weeks"));
        r.setBenefitReceived(rs.getBoolean("benefit_received"));
        r.setLikesCount(rs.getInt("likes_count"));
        r.setLikedByCurrentUser(rs.getBoolean("is_liked"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) r.setCreatedAt(ct.toInstant().toString());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) r.setUpdatedAt(ut.toInstant().toString());
        return r;
    }
}
