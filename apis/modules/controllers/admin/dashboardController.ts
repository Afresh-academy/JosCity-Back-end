import { Request, Response } from "express";
import db from "../../config/database";

// we get dashboard insights first
export const getDashboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error) {
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

const getDashboardInsights = async (): Promise<any> => {
  const insights: any = {};

  // Total users
  const usersResult = await db.query("SELECT COUNT(*) as count FROM users");
  insights.totalUsers = parseInt(usersResult.rows[0].count);

  // Pending approvals
  const pendingResult = await db.query(
    "SELECT COUNT(*) as count FROM users WHERE user_approved = 0 AND account_status = 'pending'"
  );
  insights.pendingApprovals = parseInt(pendingResult.rows[0].count);

  // Not activated
  const notActivatedResult = await db.query(
    "SELECT COUNT(*) as count FROM users WHERE user_activated = 0"
  );
  insights.notActivated = parseInt(notActivatedResult.rows[0].count);

  // Banned users or rejected users
  const bannedResult = await db.query(
    "SELECT COUNT(*) as count FROM users WHERE user_banned = 1"
  );
  insights.bannedUsers = parseInt(bannedResult.rows[0].count);

  // Online users (last 15 minutes)
  const onlineResult = await db.query(
    "SELECT COUNT(*) as count FROM users WHERE user_last_seen >= NOW() - INTERVAL '15 minutes'"
  );
  insights.onlineUsers = parseInt(onlineResult.rows[0].count);

  // Total posts
  const postsResult = await db.query("SELECT COUNT(*) as count FROM posts");
  insights.totalPosts = parseInt(postsResult.rows[0].count);

  // Total comments
  const commentsResult = await db.query(
    "SELECT COUNT(*) as count FROM posts_comments"
  );
  insights.totalComments = parseInt(commentsResult.rows[0].count);

  // Total pages
  const pagesResult = await db.query("SELECT COUNT(*) as count FROM pages");
  insights.totalPages = parseInt(pagesResult.rows[0].count);

  // Total groups
  const groupsResult = await db.query("SELECT COUNT(*) as count FROM groups");
  insights.totalGroups = parseInt(groupsResult.rows[0].count);

  // Total events
  const eventsResult = await db.query("SELECT COUNT(*) as count FROM events");
  insights.totalEvents = parseInt(eventsResult.rows[0].count);

  // Pending reports
  const reportsResult = await db.query(
    "SELECT COUNT(*) as count FROM reports WHERE seen = 0"
  );
  insights.pendingReports = parseInt(reportsResult.rows[0].count);

  // Pending verification requests
  const verificationsResult = await db.query(
    "SELECT COUNT(*) as count FROM verification_requests WHERE status = 0"
  );
  insights.pendingVerifications = parseInt(verificationsResult.rows[0].count);

  return insights;
};

const getChartData = async (): Promise<any> => {
  const chart: any = {
    users: {},
    posts: {},
    pages: {},
    groups: {},
  };

  // Get last 12 months data
  for (let i = 1; i <= 12; i++) {
    // Users this month
    const monthUsersResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE EXTRACT(YEAR FROM user_registered) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM user_registered) = $1",
      [i]
    );
    chart.users[i] = parseInt(monthUsersResult.rows[0].count);

    // Posts this month
    const monthPostsResult = await db.query(
      "SELECT COUNT(*) as count FROM posts WHERE EXTRACT(YEAR FROM time) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM time) = $1",
      [i]
    );
    chart.posts[i] = parseInt(monthPostsResult.rows[0].count);

    // Pages this month
    const monthPagesResult = await db.query(
      "SELECT COUNT(*) as count FROM pages WHERE EXTRACT(YEAR FROM page_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM page_date) = $1",
      [i]
    );
    chart.pages[i] = parseInt(monthPagesResult.rows[0].count);

    // Groups this month
    const monthGroupsResult = await db.query(
      "SELECT COUNT(*) as count FROM groups WHERE EXTRACT(YEAR FROM group_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM group_date) = $1",
      [i]
    );
    chart.groups[i] = parseInt(monthGroupsResult.rows[0].count);
  }

  return chart;
};
