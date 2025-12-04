import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'lms.db');

let db: Database | null = null;

/**
 * Initialize database connection
 */
export function initDatabase(): Promise<Database> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
            } else {
                console.log(`✅ Connected to SQLite database at ${dbPath}`);

                // Enable foreign keys
                db!.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) {
                        console.error('Error enabling foreign keys:', err);
                        reject(err);
                    } else {
                        resolve(db!);
                    }
                });
            }
        });
    });
}

/**
 * Run database schema from SQL file
 */
export async function runSchema(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    const database = await initDatabase();

    return new Promise((resolve, reject) => {
        database.exec(schema, (err) => {
            if (err) {
                console.error('Error running schema:', err);
                reject(err);
            } else {
                console.log('✅ Database schema initialized');
                resolve();
            }
        });
    });
}

/**
 * Get database instance
 */
export function getDatabase(): Database {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Run a query that returns multiple rows
 */
export function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows as T[]);
            }
        });
    });
}

/**
 * Run a query that returns a single row
 */
export function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve((row as T) || null);
            }
        });
    });
}

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
export function run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Close database connection
 */
export function closeDatabase(): Promise<void> {
    if (!db) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        db!.close((err) => {
            if (err) {
                reject(err);
            } else {
                db = null;
                console.log('✅ Database connection closed');
                resolve();
            }
        });
    });
}
