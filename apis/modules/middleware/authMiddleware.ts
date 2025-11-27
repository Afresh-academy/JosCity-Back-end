import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';

interface User {
  user_id: number;
  user_group: number;
}

interface AuthRequest extends Request {
  user?: {
    user_id: number;
  };
  admin?: User;
}

// JWT verification middleware - extracts token and sets req.user
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured in environment variables');
      res.status(500).json({ error: 'Server configuration error', message: 'JWT authentication not properly configured' });
      return;
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required', message: 'No authorization header provided' });
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      res.status(401).json({ error: 'Authentication required', message: 'No token provided' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { user_id: number; email?: string };
      req.user = { user_id: decoded.user_id };
      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired', message: 'Please login again' });
        return;
      } else if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token', message: 'Authentication failed' });
        return;
      }
      throw jwtError;
    }
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Authentication failed', message: 'Token verification error' });
  }
};

// first check if user is admin
export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const usersResult = await db.query(
      'SELECT user_id, user_group FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (usersResult.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = usersResult.rows[0] as User;
    
    // check if user is admin (user_group = 1) or moderator (user_group = 2)
    if (user.user_group !== 1 && user.user_group !== 2) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    req.admin = user;
    next();
  } catch (error: any) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed', message: error.message || 'Internal server error' });
  }
};

// this is to check if user is super admin only
export const superAdminAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const usersResult = await db.query(
      'SELECT user_id, user_group FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (usersResult.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = usersResult.rows[0] as User;
    
    // This is to allow Only super admin (user_group = 1)
    if (user.user_group !== 1) {
      res.status(403).json({ error: 'Super admin access required' });
      return;
    }

    req.admin = user;
    next();
  } catch (error: any) {
    console.error('Super admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed', message: error.message || 'Internal server error' });
  }
};

