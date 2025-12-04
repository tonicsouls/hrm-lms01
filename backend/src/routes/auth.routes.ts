import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { queryOne, run } from '../database/connection';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('firstName').optional().trim(),
        body('lastName').optional().trim()
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const result = await run(
                `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES (?, ?, ?, ?, ?)`,
                [email, passwordHash, firstName || null, lastName || null, 'student']
            );

            // Generate token
            const token = generateToken(result.lastID, email, 'student');

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: result.lastID,
                    email,
                    firstName,
                    lastName,
                    role: 'student'
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await queryOne<any>(
                'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
                [email]
            );

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Update last login
            await run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

            // Generate token
            const token = generateToken(user.id, user.email, user.role);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await queryOne<any>(
            'SELECT id, email, first_name, last_name, role, created_at, last_login FROM users WHERE id = ?',
            [req.user!.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at,
            lastLogin: user.last_login
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
