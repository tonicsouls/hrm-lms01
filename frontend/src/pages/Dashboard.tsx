import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import ModuleCard from '../components/ModuleCard';
import ProgressBar from '../components/ProgressBar';
import { LogOut, Loader2, BookOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { modules, fetchModules, isLoading } = useCourseStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchModules();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.progress === 100).length;
    const overallProgress = totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Human Risk Management
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Cybersecurity Training Platform
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.firstName || user?.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.firstName || 'Student'}! 👋
                    </h2>
                    <p className="text-gray-600">
                        Continue your cybersecurity training journey
                    </p>
                </div>

                {/* Overall Progress */}
                <div className="card mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Overall Course Progress
                    </h3>
                    <ProgressBar
                        current={completedModules}
                        total={totalModules}
                        label="Modules Completed"
                        showLabel={true}
                    />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary-600">
                                {totalModules}
                            </p>
                            <p className="text-sm text-gray-600">Total Modules</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {completedModules}
                            </p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">
                                {totalModules - completedModules}
                            </p>
                            <p className="text-sm text-gray-600">Remaining</p>
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Course Modules
                    </h3>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module) => (
                            <ModuleCard key={module.id} {...module} />
                        ))}
                    </div>
                )}

                {modules.length === 0 && !isLoading && (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">
                            No modules available yet. Check back soon!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
