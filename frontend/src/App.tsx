import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModuleView from './pages/ModuleView';
import LessonView from './pages/LessonView';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
    const { loadUser, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Load user on app mount if token exists
        if (localStorage.getItem('authToken')) {
            loadUser();
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/modules/:moduleId"
                    element={
                        <ProtectedRoute>
                            <ModuleView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/lessons/:lessonId"
                    element={
                        <ProtectedRoute>
                            <LessonView />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 404 Route */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                                <a href="/" className="btn-primary">
                                    Go Home
                                </a>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
