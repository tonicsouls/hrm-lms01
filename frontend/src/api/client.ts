import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// API functions
export const authAPI = {
    register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
        apiClient.post('/api/auth/register', data),

    login: (data: { email: string; password: string }) =>
        apiClient.post('/api/auth/login', data),

    getProfile: () =>
        apiClient.get('/api/auth/me'),
};

export const courseAPI = {
    getModules: () =>
        apiClient.get('/api/course/modules'),

    getModule: (moduleId: number) =>
        apiClient.get(`/api/course/modules/${moduleId}`),

    getLesson: (lessonId: number) =>
        apiClient.get(`/api/course/lessons/${lessonId}`),

    getLessonMedia: (lessonId: number) =>
        apiClient.get(`/api/course/lessons/${lessonId}/media`),
};

export const quizAPI = {
    getQuiz: (quizId: number) =>
        apiClient.get(`/api/quizzes/${quizId}`),

    submitQuiz: (quizId: number, answers: Record<string, number>) =>
        apiClient.post(`/api/quizzes/${quizId}/submit`, { answers }),

    getAttempts: (quizId: number) =>
        apiClient.get(`/api/quizzes/${quizId}/attempts`),
};

export const progressAPI = {
    getProgress: () =>
        apiClient.get('/api/progress'),

    completeLesson: (lessonId: number, timeSpent?: number) =>
        apiClient.post(`/api/progress/lessons/${lessonId}/complete`, { timeSpent }),

    getModuleProgress: (moduleId: number) =>
        apiClient.get(`/api/progress/modules/${moduleId}`),
};
