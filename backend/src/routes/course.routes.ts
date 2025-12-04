import { Router, Response } from 'express';
import { query, queryOne } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/course/modules
 * Get all modules with lesson counts
 */
router.get('/modules', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const modules = await query<any>(`
      SELECT 
        m.*,
        COUNT(l.id) as lesson_count,
        COALESCE(
          (SELECT COUNT(*) FROM user_progress up 
           JOIN lessons l2 ON up.lesson_id = l2.id 
           WHERE l2.module_id = m.id AND up.user_id = ? AND up.completed = 1),
          0
        ) as completed_count
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id
      GROUP BY m.id
      ORDER BY m.order_index
    `, [req.user!.id]);

        const formattedModules = modules.map(m => ({
            id: m.id,
            moduleNumber: m.module_number,
            title: m.title,
            description: m.description,
            estimatedTime: m.estimated_time,
            lessonCount: m.lesson_count,
            completedCount: m.completed_count,
            progress: m.lesson_count > 0 ? Math.round((m.completed_count / m.lesson_count) * 100) : 0
        }));

        res.json(formattedModules);
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({ error: 'Failed to get modules' });
    }
});

/**
 * GET /api/course/modules/:moduleId
 * Get specific module with all lessons
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

        const lessons = await query<any>(`
      SELECT 
        l.*,
        COALESCE(up.completed, 0) as completed,
        up.score,
        up.completed_at
      FROM lessons l
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
      WHERE l.module_id = ?
      ORDER BY l.order_index
    `, [req.user!.id, moduleId]);

        const formattedLessons = lessons.map(l => ({
            id: l.id,
            type: l.lesson_type,
            title: l.title,
            duration: l.duration,
            orderIndex: l.order_index,
            completed: Boolean(l.completed),
            score: l.score,
            completedAt: l.completed_at
        }));

        res.json({
            id: module.id,
            moduleNumber: module.module_number,
            title: module.title,
            description: module.description,
            estimatedTime: module.estimated_time,
            lessons: formattedLessons
        });
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({ error: 'Failed to get module' });
    }
});

/**
 * GET /api/course/lessons/:lessonId
 * Get lesson content including media placeholders
 */
router.get('/lessons/:lessonId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;

        const lesson = await queryOne<any>(
            'SELECT * FROM lessons WHERE id = ?',
            [lessonId]
        );

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Get media placeholders for this lesson
        const mediaPlaceholders = await query<any>(
            'SELECT * FROM media_placeholders WHERE lesson_id = ? ORDER BY order_index',
            [lessonId]
        );

        // Get user progress for this lesson
        const progress = await queryOne<any>(
            'SELECT * FROM user_progress WHERE lesson_id = ? AND user_id = ?',
            [lessonId, req.user!.id]
        );

        res.json({
            id: lesson.id,
            moduleId: lesson.module_id,
            type: lesson.lesson_type,
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            mediaPlaceholders: mediaPlaceholders.map(mp => ({
                id: mp.id,
                type: mp.media_type,
                placeholderText: mp.placeholder_text,
                description: mp.description,
                timingInfo: mp.timing_info,
                actualMediaPath: mp.actual_media_path,
                dimensions: mp.dimensions
            })),
            progress: progress ? {
                completed: Boolean(progress.completed),
                score: progress.score,
                timeSpent: progress.time_spent,
                completedAt: progress.completed_at
            } : null
        });
    } catch (error) {
        console.error('Get lesson error:', error);
        res.status(500).json({ error: 'Failed to get lesson' });
    }
});

/**
 * GET /api/course/lessons/:lessonId/media
 * Get all media placeholders for a lesson
 */
router.get('/lessons/:lessonId/media', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;

        const mediaPlaceholders = await query<any>(
            'SELECT * FROM media_placeholders WHERE lesson_id = ? ORDER BY order_index',
            [lessonId]
        );

        res.json(mediaPlaceholders.map(mp => ({
            id: mp.id,
            type: mp.media_type,
            placeholderText: mp.placeholder_text,
            description: mp.description,
            timingInfo: mp.timing_info,
            actualMediaPath: mp.actual_media_path,
            dimensions: mp.dimensions,
            orderIndex: mp.order_index
        })));
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ error: 'Failed to get media placeholders' });
    }
});

export default router;
