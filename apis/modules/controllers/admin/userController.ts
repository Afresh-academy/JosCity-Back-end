import { Request, Response } from 'express';
import db from '../../config/database';

interface AuthRequest extends Request {
  user?: {
    user_id: number;
  };
}

// Get all users with filters, also guess why we are doing this
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      group,
      account_type
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE 1=1';
    let queryParams: any[] = [];
    
    // Status filters
    if (status === 'pending') {
      whereClause += ' AND user_approved = 0 AND account_status = $' + (queryParams.length + 1);
      queryParams.push('pending');
    } else if (status === 'banned') {
      whereClause += ' AND user_banned = 1';
    } else if (status === 'not_activated') {
      whereClause += ' AND user_activated = 0';
    } else if (status === 'approved') {
      whereClause += ' AND user_approved = 1';
    } else if (status === 'online') {
      whereClause += " AND user_last_seen >= NOW() - INTERVAL '15 minutes'";
    }

    if (account_type) {
      whereClause += ' AND account_type = $' + (queryParams.length + 1);
      queryParams.push(account_type);
    }

    // User group filter
    if (group) {
      whereClause += ' AND user_group = $' + (queryParams.length + 1);
      queryParams.push(group);
    }

    // Search filter
    if (search) {
      const searchTerm = `%${search}%`;
      const paramCount = queryParams.length;
      whereClause += ` AND (user_name LIKE $${paramCount + 1} OR user_firstname LIKE $${paramCount + 2} OR user_lastname LIKE $${paramCount + 3} OR user_email LIKE $${paramCount + 4} OR user_phone LIKE $${paramCount + 5})`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Get users
    const limitParam = queryParams.length + 1;
    const offsetParam = queryParams.length + 2;
    const usersResult = await db.query(
      `SELECT user_id, user_name, user_firstname, user_lastname, user_email, user_phone, 
              user_gender, user_picture, user_cover, user_registered, user_last_seen,
              user_activated, user_approved, user_banned, user_verified, user_group,
              account_status, nin_number, address
       FROM users ${whereClause} 
       ORDER BY user_id DESC 
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...queryParams, parseInt(limit as string), offset]
    );
    
    // Get total count
    const totalResult = await db.query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      queryParams
    );
    
    res.json({
      success: true,
      data: usersResult.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalResult.rows[0].count),
        totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user details
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const usersResult = await db.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id]
    );
    
    if (usersResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Get user sessions
    const sessionsResult = await db.query(
      'SELECT * FROM users_sessions WHERE user_id = $1 ORDER BY last_activity DESC',
      [id]
    );
    
    // Get user posts count
    const postsCountResult = await db.query(
      "SELECT COUNT(*) as count FROM posts WHERE user_id = $1 AND user_type = 'user'",
      [id]
    );
    
    const user = usersResult.rows[0];
    user.sessions = sessionsResult.rows;
    user.posts_count = parseInt(postsCountResult.rows[0].count);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Approve user
export const approveUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await db.query(
      "UPDATE users SET user_approved = 1, account_status = 'approved' WHERE user_id = $1",
      [id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'user_approval', `Approved user ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'User approved successfully'
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Ban user
export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await db.query(
      'UPDATE users SET user_banned = 1, user_banned_message = $1 WHERE user_id = $2',
      [reason, id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'user_ban', `Banned user ID: ${id}. Reason: ${reason}`]
    );
    
    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

// Unban user
export const unbanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await db.query(
      'UPDATE users SET user_banned = 0, user_banned_message = NULL WHERE user_id = $1',
      [id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'user_unban', `Unbanned user ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
};

// Verify user
export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await db.query(
      'UPDATE users SET user_verified = 1 WHERE user_id = $1',
      [id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'user_verification', `Verified user ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'User verified successfully'
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
};

// Update user group
export const updateUserGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { user_group } = req.body;
    
    await db.query(
      'UPDATE users SET user_group = $1 WHERE user_id = $2',
      [user_group, id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'user_group_update', `Updated user group to ${user_group} for user ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'User group updated successfully'
    });
  } catch (error) {
    console.error('Update user group error:', error);
    res.status(500).json({ error: 'Failed to update user group' });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await db.query(
      'DELETE FROM users WHERE user_id = $1',
      [id]
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'user_delete', `Deleted user ID: ${id}`]
    );
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

