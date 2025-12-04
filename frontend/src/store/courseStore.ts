import { create } from 'zustand';
import { courseAPI, progressAPI } from '../api/client';

interface Module {
    id: number;
    moduleNumber: number;
    title: string;
    description: string;
    estimatedTime: number;
    lessonCount: number;
    completedCount: number;
    progress: number;
}

interface Lesson {
    id: number;
    type: string;
    title: string;
    duration: number;
    orderIndex: number;
    completed: boolean;
    score?: number;
    completedAt?: string;
}

interface MediaPlaceholder {
    id: number;
    type: 'image' | 'audio' | 'video';
    placeholderText: string;
    description: string;
    timingInfo?: string;
    actualMediaPath?: string;
    dimensions?: string;
}

interface LessonDetail {
    id: number;
    moduleId: number;
    type: string;
    title: string;
    content: string;
    duration: number;
    mediaPlaceholders: MediaPlaceholder[];
    progress: {
        completed: boolean;
        score?: number;
        timeSpent?: number;
        completedAt?: string;
    } | null;
}

interface CourseState {
    modules: Module[];
    currentModule: (Module & { lessons: Lesson[] }) | null;
    currentLesson: LessonDetail | null;
    isLoading: boolean;
    error: string | null;

    fetchModules: () => Promise<void>;
    fetchModule: (moduleId: number) => Promise<void>;
    fetchLesson: (lessonId: number) => Promise<void>;
    completeLesson: (lessonId: number) => Promise<void>;
    clearError: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
    modules: [],
    currentModule: null,
    currentLesson: null,
    isLoading: false,
    error: null,

    fetchModules: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await courseAPI.getModules();
            set({ modules: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch modules',
                isLoading: false
            });
        }
    },

    fetchModule: async (moduleId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await courseAPI.getModule(moduleId);
            set({ currentModule: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch module',
                isLoading: false
            });
        }
    },

    fetchLesson: async (lessonId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await courseAPI.getLesson(lessonId);
            set({ currentLesson: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch lesson',
                isLoading: false
            });
        }
    },

    completeLesson: async (lessonId) => {
        try {
            await progressAPI.completeLesson(lessonId);

            // Refresh current lesson to update progress
            const currentLesson = get().currentLesson;
            if (currentLesson && currentLesson.id === lessonId) {
                await get().fetchLesson(lessonId);
            }

            // Refresh modules to update progress
            await get().fetchModules();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to complete lesson' });
        }
    },

    clearError: () => set({ error: null }),
}));
