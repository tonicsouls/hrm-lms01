import path from 'path';
import bcrypt from 'bcrypt';
import { initDatabase, runSchema, run, closeDatabase } from '../database/connection';
import { parseAllModules, extractMediaPlaceholders } from '../parsers/contentParser';

/**
 * Seed the database with course content and demo users
 */
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Initialize database and run schema
        await initDatabase();
        await runSchema();

        // Create demo users
        console.log('👤 Creating demo users...');
        await createDemoUsers();

        // Parse and insert course content
        console.log('\n📚 Parsing course content...');
        const contentDir = path.join(__dirname, '../../../..');
        const modules = await parseAllModules(contentDir);
        console.log(`✅ Parsed ${modules.length} modules\n`);

        // Insert modules and lessons
        console.log('💾 Inserting course content into database...');
        for (const module of modules) {
            await insertModule(module);
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Modules: ${modules.length}`);
        console.log(`   - Total lessons: ${modules.reduce((sum, m) => sum + m.videoScripts.length + 1, 0)}`);
        console.log(`   - Total quizzes: ${modules.length}`);
        console.log('\n👥 Demo Users:');
        console.log('   Student: student@example.com / password123');
        console.log('   Admin: admin@example.com / admin123\n');

        await closeDatabase();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

/**
 * Create demo user accounts
 */
async function createDemoUsers() {
    const users = [
        {
            email: 'student@example.com',
            password: 'password123',
            firstName: 'Demo',
            lastName: 'Student',
            role: 'student'
        },
        {
            email: 'admin@example.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
        }
    ];

    for (const user of users) {
        const passwordHash = await bcrypt.hash(user.password, 10);

        await run(
            `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.email, passwordHash, user.firstName, user.lastName, user.role]
        );

        console.log(`   ✓ Created ${user.role}: ${user.email}`);
    }
}

/**
 * Insert a module and its lessons into the database
 */
async function insertModule(module: any) {
    // Insert module
    const moduleResult = await run(
        `INSERT INTO modules (module_number, title, description, estimated_time, order_index)
     VALUES (?, ?, ?, ?, ?)`,
        [module.moduleNumber, module.title, module.description, module.estimatedTime, module.moduleNumber]
    );

    const moduleId = moduleResult.lastID;
    console.log(`   ✓ Module ${module.moduleNumber}: ${module.title}`);

    let lessonOrder = 0;

    // Insert video lessons
    for (const videoScript of module.videoScripts) {
        const lessonResult = await run(
            `INSERT INTO lessons (module_id, lesson_type, title, content, duration, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [moduleId, 'video', videoScript.title, videoScript.content, videoScript.estimatedDuration, lessonOrder++]
        );

        const lessonId = lessonResult.lastID;

        // Insert media placeholders for this video
        const placeholders = extractMediaPlaceholders(videoScript);
        for (let i = 0; i < placeholders.length; i++) {
            const placeholder = placeholders[i];
            await run(
                `INSERT INTO media_placeholders (lesson_id, media_type, placeholder_text, description, timing_info, dimensions, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    lessonId,
                    placeholder.type,
                    placeholder.description,
                    placeholder.description,
                    placeholder.timingInfo || null,
                    placeholder.dimensions || null,
                    i
                ]
            );
        }

        console.log(`      - Video: ${videoScript.title} (${placeholders.length} media placeholders)`);
    }

    // Insert reading lesson (module analysis)
    if (module.analysis) {
        await run(
            `INSERT INTO lessons (module_id, lesson_type, title, content, duration, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [moduleId, 'reading', `${module.title} - Overview`, module.analysis, 600, lessonOrder++]
        );
        console.log(`      - Reading: ${module.title} - Overview`);
    }

    // Insert quiz lesson
    if (module.quiz && module.quiz.questions.length > 0) {
        const quizLessonResult = await run(
            `INSERT INTO lessons (module_id, lesson_type, title, content, duration, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [moduleId, 'quiz', module.quiz.title, '', 600, lessonOrder++]
        );

        const quizLessonId = quizLessonResult.lastID;

        // Insert quiz
        await run(
            `INSERT INTO quizzes (lesson_id, title, questions, passing_score)
       VALUES (?, ?, ?, ?)`,
            [quizLessonId, module.quiz.title, JSON.stringify(module.quiz.questions), 70]
        );

        console.log(`      - Quiz: ${module.quiz.questions.length} questions`);
    }
}

// Run the seeding
seedDatabase();
