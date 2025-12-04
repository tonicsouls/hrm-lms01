import fs from 'fs';
import path from 'path';

export interface ModuleContent {
    moduleNumber: number;
    title: string;
    description: string;
    estimatedTime: number;
    analysis: string;
    videoScripts: VideoScript[];
    quiz: Quiz;
    keyTakeaways: string;
}

export interface VideoScript {
    title: string;
    content: string;
    scenes: Scene[];
    estimatedDuration: number; // in seconds
}

export interface Scene {
    title: string;
    startTime: string;
    endTime: string;
    visuals: string[];
    narration: string[];
}

export interface Quiz {
    title: string;
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    rationale: string;
}

export interface MediaPlaceholder {
    type: 'image' | 'audio' | 'video';
    description: string;
    timingInfo?: string;
    dimensions?: string;
}

/**
 * Parse all module directories and extract content
 */
export async function parseAllModules(baseDir: string): Promise<ModuleContent[]> {
    const modules: ModuleContent[] = [];

    // Module directories are named Module_00_Introduction, Module_01_..., etc.
    const moduleDirs = fs.readdirSync(baseDir)
        .filter(name => name.startsWith('Module_') && fs.statSync(path.join(baseDir, name)).isDirectory())
        .sort();

    for (const moduleDir of moduleDirs) {
        const modulePath = path.join(baseDir, moduleDir);
        const moduleContent = await parseModule(modulePath, moduleDir);
        if (moduleContent) {
            modules.push(moduleContent);
        }
    }

    return modules;
}

/**
 * Parse a single module directory
 */
async function parseModule(modulePath: string, moduleDirName: string): Promise<ModuleContent | null> {
    try {
        // Extract module number from directory name (e.g., "Module_00_Introduction" -> 0)
        const moduleNumberMatch = moduleDirName.match(/Module_(\d+)_/);
        if (!moduleNumberMatch) {
            console.warn(`Could not extract module number from ${moduleDirName}`);
            return null;
        }
        const moduleNumber = parseInt(moduleNumberMatch[1], 10);

        // Extract title from directory name
        const titlePart = moduleDirName.replace(/Module_\d+_/, '').replace(/_/g, ' ');

        // Read module files
        const analysisPath = path.join(modulePath, '01_Module_Analysis.md');
        const videoScriptsPath = path.join(modulePath, '02_Video_Scripts.md');
        const quizPath = path.join(modulePath, '03_Quiz.md');
        const takeawaysPath = path.join(modulePath, '04_Key_Takeaways_and_Infographics.md');

        const analysis = fs.existsSync(analysisPath) ? fs.readFileSync(analysisPath, 'utf-8') : '';
        const videoScriptsContent = fs.existsSync(videoScriptsPath) ? fs.readFileSync(videoScriptsPath, 'utf-8') : '';
        const quizContent = fs.existsSync(quizPath) ? fs.readFileSync(quizPath, 'utf-8') : '';
        const keyTakeaways = fs.existsSync(takeawaysPath) ? fs.readFileSync(takeawaysPath, 'utf-8') : '';

        // Parse video scripts
        const videoScripts = parseVideoScripts(videoScriptsContent);

        // Parse quiz
        const quiz = parseQuiz(quizContent, titlePart);

        // Extract description from analysis (first paragraph after title)
        const description = extractDescription(analysis);

        // Estimate total time (sum of video durations + quiz time)
        const estimatedTime = videoScripts.reduce((sum, script) => sum + script.estimatedDuration, 0) / 60 + 10; // +10 min for quiz

        return {
            moduleNumber,
            title: titlePart,
            description,
            estimatedTime: Math.round(estimatedTime),
            analysis,
            videoScripts,
            quiz,
            keyTakeaways
        };
    } catch (error) {
        console.error(`Error parsing module ${moduleDirName}:`, error);
        return null;
    }
}

/**
 * Parse video scripts from markdown content
 */
function parseVideoScripts(content: string): VideoScript[] {
    const scripts: VideoScript[] = [];

    // Split by video title markers (### Video Title:)
    const videoSections = content.split(/###\s+Video Title:/);

    for (let i = 1; i < videoSections.length; i++) {
        const section = videoSections[i];

        // Extract title (first line with backticks)
        const titleMatch = section.match(/`([^`]+)`/);
        const title = titleMatch ? titleMatch[1] : `Video ${i}`;

        // Parse scenes
        const scenes = parseScenes(section);

        // Estimate duration from timing markers
        const estimatedDuration = estimateDuration(section);

        scripts.push({
            title,
            content: section.trim(),
            scenes,
            estimatedDuration
        });
    }

    return scripts;
}

/**
 * Parse scenes from video script content
 */
function parseScenes(content: string): Scene[] {
    const scenes: Scene[] = [];

    // Match scene sections: **(0:00 - 0:30) - Part 1: Title**
    const sceneMatches = content.matchAll(/\*\*\((\d+:\d+)\s*-\s*(\d+:\d+)\)\s*-\s*([^*]+)\*\*/g);

    for (const match of sceneMatches) {
        const startTime = match[1];
        const endTime = match[2];
        const title = match[3].trim();

        // Find the scene content (between this marker and the next)
        const sceneStart = match.index!;
        const nextSceneMatch = content.indexOf('**(', sceneStart + 1);
        const sceneEnd = nextSceneMatch > 0 ? nextSceneMatch : content.length;
        const sceneContent = content.substring(sceneStart, sceneEnd);

        // Extract VISUAL and NARRATOR sections
        const visuals = extractMarkedSections(sceneContent, 'VISUAL');
        const narration = extractMarkedSections(sceneContent, 'NARRATOR');

        scenes.push({
            title,
            startTime,
            endTime,
            visuals,
            narration
        });
    }

    return scenes;
}

/**
 * Extract sections marked with **VISUAL:** or **NARRATOR (V.O.):**
 */
function extractMarkedSections(content: string, marker: string): string[] {
    const sections: string[] = [];
    const regex = new RegExp(`\\*\\*${marker}[^:]*:\\*\\*\\s*([^*]+)`, 'gi');
    const matches = content.matchAll(regex);

    for (const match of matches) {
        sections.push(match[1].trim().replace(/^["']|["']$/g, ''));
    }

    return sections;
}

/**
 * Estimate video duration from timing markers
 */
function estimateDuration(content: string): number {
    // Find the last timing marker
    const timings = content.matchAll(/\((\d+):(\d+)\s*-\s*(\d+):(\d+)\)/g);
    let maxSeconds = 0;

    for (const match of timings) {
        const endMinutes = parseInt(match[3], 10);
        const endSeconds = parseInt(match[4], 10);
        const totalSeconds = endMinutes * 60 + endSeconds;
        maxSeconds = Math.max(maxSeconds, totalSeconds);
    }

    return maxSeconds || 360; // Default to 6 minutes if no timing found
}

/**
 * Parse quiz from markdown content
 */
function parseQuiz(content: string, moduleTitle: string): Quiz {
    const questions: QuizQuestion[] = [];

    // Match question blocks: **1. Question text**
    const questionMatches = content.matchAll(/\*\*(\d+)\.\s+([^*]+)\*\*/g);

    for (const match of questionMatches) {
        const questionNum = match[1];
        const questionText = match[2].trim();

        // Find the question block
        const questionStart = match.index!;
        const nextQuestionMatch = content.indexOf(`**${parseInt(questionNum) + 1}.`, questionStart + 1);
        const questionEnd = nextQuestionMatch > 0 ? nextQuestionMatch : content.length;
        const questionBlock = content.substring(questionStart, questionEnd);

        // Extract options (lines starting with * A., * B., etc.)
        const options: string[] = [];
        const optionMatches = questionBlock.matchAll(/\*\s+([A-D])\.\s+([^\n]+)/g);
        for (const optMatch of optionMatches) {
            options.push(optMatch[2].trim());
        }

        // Extract correct answer
        const correctMatch = questionBlock.match(/\*\s+\*\*Correct:\s*([A-D])\*\*/);
        const correctLetter = correctMatch ? correctMatch[1] : 'A';
        const correctAnswer = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);

        // Extract rationale
        const rationaleMatch = questionBlock.match(/\*\s+\*\*Rationale:\*\*\s+([^\n]+)/);
        const rationale = rationaleMatch ? rationaleMatch[1].trim() : '';

        if (options.length > 0) {
            questions.push({
                id: `q${questionNum}`,
                question: questionText,
                options,
                correctAnswer,
                rationale
            });
        }
    }

    return {
        title: `${moduleTitle} Quiz`,
        questions
    };
}

/**
 * Extract description from module analysis
 */
function extractDescription(analysis: string): string {
    // Find first paragraph after the title
    const lines = analysis.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip title lines (starting with #) and empty lines
        if (!line.startsWith('#') && line.length > 20) {
            return line.substring(0, 200) + (line.length > 200 ? '...' : '');
        }
    }

    return 'Explore the key concepts and principles of human risk management in cybersecurity.';
}

/**
 * Extract media placeholders from video script
 */
export function extractMediaPlaceholders(videoScript: VideoScript): MediaPlaceholder[] {
    const placeholders: MediaPlaceholder[] = [];

    // Add video placeholder for the entire script
    placeholders.push({
        type: 'video',
        description: `[VIDEO PLACEHOLDER: ${videoScript.title}]`,
        timingInfo: `Duration: ${Math.floor(videoScript.estimatedDuration / 60)}:${(videoScript.estimatedDuration % 60).toString().padStart(2, '0')}`,
        dimensions: '1920x1080'
    });

    // Extract image placeholders from VISUAL markers
    for (const scene of videoScript.scenes) {
        for (const visual of scene.visuals) {
            if (visual.length > 10) { // Only meaningful descriptions
                placeholders.push({
                    type: 'image',
                    description: visual.substring(0, 100),
                    timingInfo: `${scene.startTime} - ${scene.endTime}`
                });
            }
        }
    }

    return placeholders;
}
