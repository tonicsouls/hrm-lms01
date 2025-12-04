import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../database/connection';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

        const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string; role: string };

        // Verify user still exists in database
        const user = await queryOne(
            'SELECT id, email, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: number, email: string, role: string): string {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(
        { userId, email, role },
        jwtSecret,
        { expiresIn }
    );
}
