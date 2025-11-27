"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPost = exports.deletePost = exports.approvePost = exports.getPosts = void 0;
const database_1 = __importDefault(require("../../config/database"));
// Get all posts
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = 'WHERE 1=1';
        let queryParams = [];
        // Status filters
        if (status === 'pending') {
            whereClause += ' AND pre_approved = 0 AND has_approved = 0';
        }
        else if (status === 'approved') {
            whereClause += ' AND (pre_approved = 1 OR has_approved = 1)';
        }
        // Post type filter
        if (type) {
            whereClause += ' AND post_type = $' + (queryParams.length + 1);
            queryParams.push(type);
        }
        // Search filter
        if (search) {
            const searchTerm = `%${search}%`;
            const paramCount = queryParams.length;
            whereClause += ` AND (text LIKE $${paramCount + 1} OR posts.post_id = $${paramCount + 2})`;
            queryParams.push(searchTerm, search);
        }
        // Get posts with author info
        const limitParam = queryParams.length + 1;
        const offsetParam = queryParams.length + 2;
        const postsResult = await database_1.default.query(`SELECT p.*, 
              u.user_name, u.user_firstname, u.user_lastname, u.user_gender, u.user_picture,
              pg.page_name, pg.page_title, pg.page_picture
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.user_id AND p.user_type = 'user'
       LEFT JOIN pages pg ON p.user_id = pg.page_id AND p.user_type = 'page'
       ${whereClause} 
       ORDER BY p.post_id DESC 
       LIMIT $${limitParam} OFFSET $${offsetParam}`, [...queryParams, parseInt(limit), offset]);
        // Format post data
        const formattedPosts = postsResult.rows.map((post) => {
            const formatted = { ...post };
            // Set author info based on user_type
            if (post.user_type === 'user') {
                formatted.author_name = post.user_firstname + ' ' + post.user_lastname;
                formatted.author_picture = post.user_picture;
                formatted.author_url = `/profile/${post.user_name}`;
            }
            else if (post.user_type === 'page') {
                formatted.author_name = post.page_title;
                formatted.author_picture = post.page_picture;
                formatted.author_url = `/pages/${post.page_name}`;
            }
            return formatted;
        });
        // Get total count
        const totalResult = await database_1.default.query(`SELECT COUNT(*) as count FROM posts p ${whereClause}`, queryParams);
        res.json({
            success: true,
            data: formattedPosts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(totalResult.rows[0].count),
                totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};
exports.getPosts = getPosts;
// Let us approve post
const approvePost = async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.query('UPDATE posts SET pre_approved = 1, has_approved = 1 WHERE post_id = $1', [id]);
        // This is an admin action
        await database_1.default.query('INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)', [req.user.user_id, 'post_approval', `Approved post ID: ${id}`]);
        res.json({
            success: true,
            message: 'Post approved successfully'
        });
    }
    catch (error) {
        console.error('Approve post error:', error);
        res.status(500).json({ error: 'Failed to approve post' });
    }
};
exports.approvePost = approvePost;
// We can delete post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.query('DELETE FROM posts WHERE post_id = $1', [id]);
        // Log admin action
        await database_1.default.query('INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)', [req.user.user_id, 'post_delete', `Deleted post ID: ${id}`]);
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};
exports.deletePost = deletePost;
//Let us Get post details
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const postsResult = await database_1.default.query(`SELECT p.*, 
              u.user_name, u.user_firstname, u.user_lastname, u.user_gender, u.user_picture,
              pg.page_name, pg.page_title, pg.page_picture
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.user_id AND p.user_type = 'user'
       LEFT JOIN pages pg ON p.user_id = pg.page_id AND p.user_type = 'page'
       WHERE p.post_id = $1`, [id]);
        if (postsResult.rows.length === 0) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        const post = postsResult.rows[0];
        // Get post comments count
        const commentsCountResult = await database_1.default.query("SELECT COUNT(*) as count FROM posts_comments WHERE node_id = $1 AND node_type = 'post'", [id]);
        // Get post reactions count
        const reactionsCountResult = await database_1.default.query('SELECT COUNT(*) as count FROM posts_reactions WHERE post_id = $1', [id]);
        post.comments_count = parseInt(commentsCountResult.rows[0].count);
        post.reactions_count = parseInt(reactionsCountResult.rows[0].count);
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};
exports.getPost = getPost;
//# sourceMappingURL=postController.js.map