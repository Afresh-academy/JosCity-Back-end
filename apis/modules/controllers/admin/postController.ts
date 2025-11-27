import { Request, Response } from 'express';
import db from '../../config/database';

interface AuthRequest extends Request {
  user?: {
    user_id: number;
  };
}

// Get all posts
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      type,
      search 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE 1=1';
    let queryParams: any[] = [];
    
    // Status filters
    if (status === 'pending') {
      whereClause += ' AND pre_approved = 0 AND has_approved = 0';
    } else if (status === 'approved') {
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
    const postsResult = await db.query(
      `SELECT p.*, 
              u.user_name, u.user_firstname, u.user_lastname, u.user_gender, u.user_picture,
              pg.page_name, pg.page_title, pg.page_picture
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.user_id AND p.user_type = 'user'
       LEFT JOIN pages pg ON p.user_id = pg.page_id AND p.user_type = 'page'
       ${whereClause} 
       ORDER BY p.post_id DESC 
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...queryParams, parseInt(limit as string), offset]
    );
    
    // Format post data
    const formattedPosts = postsResult.rows.map((post: any) => {
      const formatted = { ...post };
      
      // Set author info based on user_type
      if (post.user_type === 'user') {
        formatted.author_name = post.user_firstname + ' ' + post.user_lastname;
        formatted.author_picture = post.user_picture;
        formatted.author_url = `/profile/${post.user_name}`;
      } else if (post.user_type === 'page') {
        formatted.author_name = post.page_title;
        formatted.author_picture = post.page_picture;
        formatted.author_url = `/pages/${post.page_name}`;
      }
      
      return formatted;
    });
    
    // Get total count
    const totalResult = await db.query(
      `SELECT COUNT(*) as count FROM posts p ${whereClause}`,
      queryParams
    );
    
    res.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalResult.rows[0].count),
        totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Let us approve post
export const approvePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await db.query(
      'UPDATE posts SET pre_approved = 1, has_approved = 1 WHERE post_id = $1',
      [id]
    );
    
    // This is an admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'post_approval', `Approved post ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'Post approved successfully'
    });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ error: 'Failed to approve post' });
  }
};

// We can delete post
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await db.query(
      'DELETE FROM posts WHERE post_id = $1',
      [id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'post_delete', `Deleted post ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

//Let us Get post details
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const postsResult = await db.query(
      `SELECT p.*, 
              u.user_name, u.user_firstname, u.user_lastname, u.user_gender, u.user_picture,
              pg.page_name, pg.page_title, pg.page_picture
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.user_id AND p.user_type = 'user'
       LEFT JOIN pages pg ON p.user_id = pg.page_id AND p.user_type = 'page'
       WHERE p.post_id = $1`,
      [id]
    );
    
    if (postsResult.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    const post = postsResult.rows[0];
    
    // Get post comments count
    const commentsCountResult = await db.query(
      "SELECT COUNT(*) as count FROM posts_comments WHERE node_id = $1 AND node_type = 'post'",
      [id]
    );
    
    // Get post reactions count
    const reactionsCountResult = await db.query(
      'SELECT COUNT(*) as count FROM posts_reactions WHERE post_id = $1',
      [id]
    );
    
    post.comments_count = parseInt(commentsCountResult.rows[0].count);
    post.reactions_count = parseInt(reactionsCountResult.rows[0].count);
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

