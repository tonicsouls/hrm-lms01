import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/connection';

// Import routes
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import quizRoutes from './routes/quiz.routes';
import progressRoutes from './routes/progress.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();
        console.log('✅ Database initialized');

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Documentation:`);
            console.log(`   - Health: GET /health`);
            console.log(`   - Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me`);
            console.log(`   - Course: GET /api/course/modules, GET /api/course/modules/:id`);
            console.log(`   - Quizzes: GET /api/quizzes/:id, POST /api/quizzes/:id/submit`);
            console.log(`   - Progress: GET /api/progress, POST /api/progress/lessons/:id/complete`);
            console.log(`\n✨ Ready to accept requests!\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
