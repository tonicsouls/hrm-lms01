import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, run } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/progress
 * Get user's overall course progress
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        // Get total lessons and completed lessons
        const stats = await queryOne<any>(`
      SELECT 
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN up.completed = 1 THEN l.id END) as completed_lessons,
        COUNT(DISTINCT l.module_id) as total_modules,
        COUNT(DISTINCT CASE WHEN up.completed = 1 THEN l.module_id END) as completed_modules
      FROM lessons l
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
    `, [req.user!.id]);

        // Get module-level progress
        const moduleProgress = await query<any>(`
      SELECT 
        m.id,
        m.module_number,
        m.title,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN up.completed = 1 THEN l.id END) as completed_lessons
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
      GROUP BY m.id
      ORDER BY m.order_index
    `, [req.user!.id]);

        const overallProgress = stats.total_lessons > 0
            ? Math.round((stats.completed_lessons / stats.total_lessons) * 100)
            : 0;

        res.json({
            overall: {
                totalLessons: stats.total_lessons,
                completedLessons: stats.completed_lessons,
                totalModules: stats.total_modules,
                completedModules: stats.completed_modules,
                progressPercentage: overallProgress
            },
            modules: moduleProgress.map(m => ({
                moduleId: m.id,
                moduleNumber: m.module_number,
                title: m.title,
                totalLessons: m.total_lessons,
                completedLessons: m.completed_lessons,
                progressPercentage: m.total_lessons > 0
                    ? Math.round((m.completed_lessons / m.total_lessons) * 100)
                    : 0
            }))
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

/**
 * POST /api/progress/lessons/:lessonId/complete
 * Mark lesson as completed
 */
router.post(
    '/lessons/:lessonId/complete',
    [
        body('timeSpent').optional().isInt({ min: 0 })
    ],
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { lessonId } = req.params;
            const { timeSpent } = req.body;

            // Check if lesson exists
            const lesson = await queryOne('SELECT id FROM lessons WHERE id = ?', [lessonId]);
            if (!lesson) {
                return res.status(404).json({ error: 'Lesson not found' });
            }

            // Check if progress already exists
            const existingProgress = await queryOne(
                'SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ?',
                [req.user!.id, lessonId]
            );

            if (existingProgress) {
                // Update existing progress
                await run(
                    `UPDATE user_progress 
           SET completed = 1, time_spent = ?, completed_at = CURRENT_TIMESTAMP
           WHERE user_id = ? AND lesson_id = ?`,
                    [timeSpent || null, req.user!.id, lessonId]
                );
            } else {
                // Create new progress record
                await run(
                    `INSERT INTO user_progress (user_id, lesson_id, completed, time_spent, completed_at)
           VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)`,
                    [req.user!.id, lessonId, timeSpent || null]
                );
            }

            res.json({ message: 'Lesson marked as completed' });
        } catch (error) {
            console.error('Complete lesson error:', error);
            res.status(500).json({ error: 'Failed to mark lesson as completed' });
        }
    }
);

/**
 * GET /api/progress/modules/:moduleId
 * Get progress for specific module
 */
router.get('/modules/:moduleId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { moduleId } = req.params;

        const module = await queryOne<any>(
            'SELECT * FROM modules WHERE id = ?',
            [moduleId]
        );

        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }

        const lessonProgress = await query<any>(`
      SELECT 
        l.id,
        l.title,
        l.lesson_type,
        COALESCE(up.completed, 0) as completed,
        up.score,
        up.time_spent,
        up.completed_at
      FROM lessons l
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
      WHERE l.module_id = ?
      ORDER BY l.order_index
    `, [req.user!.id, moduleId]);

        const totalLessons = lessonProgress.length;
        const completedLessons = lessonProgress.filter(l => l.completed).length;
        const progressPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        res.json({
            moduleId: module.id,
            moduleNumber: module.module_number,
            title: module.title,
            totalLessons,
            completedLessons,
            progressPercentage,
            lessons: lessonProgress.map(l => ({
                lessonId: l.id,
                title: l.title,
                type: l.lesson_type,
                completed: Boolean(l.completed),
                score: l.score,
                timeSpent: l.time_spent,
                completedAt: l.completed_at
            }))
        });
    } catch (error) {
        console.error('Get module progress error:', error);
        res.status(500).json({ error: 'Failed to get module progress' });
    }
});

export default router;
