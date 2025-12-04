-- Human Risk Management LMS Database Schema
-- SQLite3 Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    estimated_time INTEGER, -- in minutes
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    lesson_type TEXT NOT NULL CHECK(lesson_type IN ('video', 'quiz', 'reading', 'interactive')),
    title TEXT NOT NULL,
    content TEXT, -- Markdown content or JSON data
    content_path TEXT, -- Path to original markdown file
    duration INTEGER, -- in seconds
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Media placeholders table
CREATE TABLE IF NOT EXISTS media_placeholders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK(media_type IN ('image', 'audio', 'video')),
    placeholder_text TEXT NOT NULL,
    description TEXT,
    timing_info TEXT, -- e.g., "0:00-2:30" or "Duration: 5:30"
    actual_media_path TEXT, -- Path to actual media file (NULL for placeholders)
    dimensions TEXT, -- e.g., "1920x1080" for images/videos
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    questions TEXT NOT NULL, -- JSON array of questions
    passing_score INTEGER DEFAULT 70, -- percentage
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    score INTEGER, -- for quizzes, NULL for other lesson types
    time_spent INTEGER, -- in seconds
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- User quiz attempts table
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    answers TEXT NOT NULL, -- JSON object with question_id: answer_id mapping
    score INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_media_lesson_id ON media_placeholders(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON user_quiz_attempts(quiz_id);
