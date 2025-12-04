import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, run } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/quizzes/:quizId
 * Get quiz questions (without answers for security)
 */
router.get('/:quizId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { quizId } = req.params;

        const quiz = await queryOne<any>(
            'SELECT * FROM quizzes WHERE id = ?',
            [quizId]
        );

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Parse questions and remove correct answers
        const questions = JSON.parse(quiz.questions);
        const questionsWithoutAnswers = questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options
            // Deliberately omit correctAnswer and rationale
        }));

        res.json({
            id: quiz.id,
            lessonId: quiz.lesson_id,
            title: quiz.title,
            passingScore: quiz.passing_score,
            questions: questionsWithoutAnswers
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to get quiz' });
    }
});

/**
 * POST /api/quizzes/:quizId/submit
 * Submit quiz answers and get score with feedback
 */
router.post(
    '/:quizId/submit',
    [
        body('answers').isObject()
    ],
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { quizId } = req.params;
            const { answers } = req.body; // { questionId: selectedOptionIndex }

            const quiz = await queryOne<any>(
                'SELECT * FROM quizzes WHERE id = ?',
                [quizId]
            );

            if (!quiz) {
                return res.status(404).json({ error: 'Quiz not found' });
            }

            // Parse questions with correct answers
            const questions = JSON.parse(quiz.questions);

            // Calculate score and prepare feedback
            let correctCount = 0;
            const feedback = questions.map((q: any) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                if (isCorrect) {
                    correctCount++;
                }

                return {
                    questionId: q.id,
                    question: q.question,
                    options: q.options,
                    userAnswer,
                    correctAnswer: q.correctAnswer,
                    isCorrect,
                    rationale: q.rationale
                };
            });

            const score = Math.round((correctCount / questions.length) * 100);
            const passed = score >= quiz.passing_score;

            // Get previous attempt count
            const previousAttempts = await query<any>(
                'SELECT COUNT(*) as count FROM user_quiz_attempts WHERE user_id = ? AND quiz_id = ?',
                [req.user!.id, quizId]
            );
            const attemptNumber = (previousAttempts[0]?.count || 0) + 1;

            // Save attempt
            await run(
                `INSERT INTO user_quiz_attempts (user_id, quiz_id, answers, score, attempt_number)
         VALUES (?, ?, ?, ?, ?)`,
                [req.user!.id, quizId, JSON.stringify(answers), score, attemptNumber]
            );

            // Update user progress for the lesson
            const lessonId = quiz.lesson_id;
            const existingProgress = await queryOne(
                'SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ?',
                [req.user!.id, lessonId]
            );

            if (existingProgress) {
                await run(
                    `UPDATE user_progress 
           SET completed = ?, score = ?, completed_at = CURRENT_TIMESTAMP
           WHERE user_id = ? AND lesson_id = ?`,
                    [passed ? 1 : 0, score, req.user!.id, lessonId]
                );
            } else {
                await run(
                    `INSERT INTO user_progress (user_id, lesson_id, completed, score, completed_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [req.user!.id, lessonId, passed ? 1 : 0, score]
                );
            }

            res.json({
                score,
                passed,
                passingScore: quiz.passing_score,
                correctCount,
                totalQuestions: questions.length,
                attemptNumber,
                feedback
            });
        } catch (error) {
            console.error('Submit quiz error:', error);
            res.status(500).json({ error: 'Failed to submit quiz' });
        }
    }
);

/**
 * GET /api/quizzes/:quizId/attempts
 * Get user's previous quiz attempts
 */
router.get('/:quizId/attempts', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { quizId } = req.params;

        const attempts = await query<any>(
            `SELECT id, score, attempt_number, submitted_at 
       FROM user_quiz_attempts 
       WHERE user_id = ? AND quiz_id = ?
       ORDER BY submitted_at DESC`,
            [req.user!.id, quizId]
        );

        res.json(attempts.map(a => ({
            id: a.id,
            score: a.score,
            attemptNumber: a.attempt_number,
            submittedAt: a.submitted_at
        })));
    } catch (error) {
        console.error('Get attempts error:', error);
        res.status(500).json({ error: 'Failed to get attempts' });
    }
});

export default router;
