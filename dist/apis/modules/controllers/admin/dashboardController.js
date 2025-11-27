"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const database_1 = __importDefault(require("../../config/database"));
// we get dashboard insights first
const getDashboard = async (_req, res) => {
    try {
        const insights = await getDashboardInsights();
        const chartData = await getChartData();
        res.json({
            success: true,
            data: {
                insights,
                chart: chartData,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to load dashboard" });
    }
};
exports.getDashboard = getDashboard;
const getDashboardInsights = async () => {
    const insights = {};
    // Total users
    const usersResult = await database_1.default.query("SELECT COUNT(*) as count FROM users");
    insights.totalUsers = parseInt(usersResult.rows[0].count);
    // Pending approvals
    const pendingResult = await database_1.default.query("SELECT COUNT(*) as count FROM users WHERE user_approved = 0 AND account_status = 'pending'");
    insights.pendingApprovals = parseInt(pendingResult.rows[0].count);
    // Not activated
    const notActivatedResult = await database_1.default.query("SELECT COUNT(*) as count FROM users WHERE user_activated = 0");
    insights.notActivated = parseInt(notActivatedResult.rows[0].count);
    // Banned users or rejected users
    const bannedResult = await database_1.default.query("SELECT COUNT(*) as count FROM users WHERE user_banned = 1");
    insights.bannedUsers = parseInt(bannedResult.rows[0].count);
    // Online users (last 15 minutes)
    const onlineResult = await database_1.default.query("SELECT COUNT(*) as count FROM users WHERE user_last_seen >= NOW() - INTERVAL '15 minutes'");
    insights.onlineUsers = parseInt(onlineResult.rows[0].count);
    // Total posts
    const postsResult = await database_1.default.query("SELECT COUNT(*) as count FROM posts");
    insights.totalPosts = parseInt(postsResult.rows[0].count);
    // Total comments
    const commentsResult = await database_1.default.query("SELECT COUNT(*) as count FROM posts_comments");
    insights.totalComments = parseInt(commentsResult.rows[0].count);
    // Total pages
    const pagesResult = await database_1.default.query("SELECT COUNT(*) as count FROM pages");
    insights.totalPages = parseInt(pagesResult.rows[0].count);
    // Total groups
    const groupsResult = await database_1.default.query("SELECT COUNT(*) as count FROM groups");
    insights.totalGroups = parseInt(groupsResult.rows[0].count);
    // Total events
    const eventsResult = await database_1.default.query("SELECT COUNT(*) as count FROM events");
    insights.totalEvents = parseInt(eventsResult.rows[0].count);
    // Pending reports
    const reportsResult = await database_1.default.query("SELECT COUNT(*) as count FROM reports WHERE seen = 0");
    insights.pendingReports = parseInt(reportsResult.rows[0].count);
    // Pending verification requests
    const verificationsResult = await database_1.default.query("SELECT COUNT(*) as count FROM verification_requests WHERE status = 0");
    insights.pendingVerifications = parseInt(verificationsResult.rows[0].count);
    return insights;
};
const getChartData = async () => {
    const chart = {
        users: {},
        posts: {},
        pages: {},
        groups: {},
    };
    // Get last 12 months data
    for (let i = 1; i <= 12; i++) {
        // Users this month
        const monthUsersResult = await database_1.default.query("SELECT COUNT(*) as count FROM users WHERE EXTRACT(YEAR FROM user_registered) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM user_registered) = $1", [i]);
        chart.users[i] = parseInt(monthUsersResult.rows[0].count);
        // Posts this month
        const monthPostsResult = await database_1.default.query("SELECT COUNT(*) as count FROM posts WHERE EXTRACT(YEAR FROM time) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM time) = $1", [i]);
        chart.posts[i] = parseInt(monthPostsResult.rows[0].count);
        // Pages this month
        const monthPagesResult = await database_1.default.query("SELECT COUNT(*) as count FROM pages WHERE EXTRACT(YEAR FROM page_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM page_date) = $1", [i]);
        chart.pages[i] = parseInt(monthPagesResult.rows[0].count);
        // Groups this month
        const monthGroupsResult = await database_1.default.query("SELECT COUNT(*) as count FROM groups WHERE EXTRACT(YEAR FROM group_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM group_date) = $1", [i]);
        chart.groups[i] = parseInt(monthGroupsResult.rows[0].count);
    }
    return chart;
};
//# sourceMappingURL=dashboardController.js.map