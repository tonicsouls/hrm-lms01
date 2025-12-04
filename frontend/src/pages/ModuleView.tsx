import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import { ArrowLeft, CheckCircle2, Circle, Loader2, BookOpen, FileQuestion, Video } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';

const ModuleView: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const { currentModule, fetchModule, isLoading } = useCourseStore();

    useEffect(() => {
        if (moduleId) {
            fetchModule(parseInt(moduleId));
        }
    }, [moduleId]);

    if (isLoading || !currentModule) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'quiz':
                return <FileQuestion className="w-5 h-5" />;
            case 'reading':
                return <BookOpen className="w-5 h-5" />;
            default:
                return <Circle className="w-5 h-5" />;
        }
    };

    const handleLessonClick = (lessonId: number) => {
        navigate(`/lessons/${lessonId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                    {currentModule.moduleNumber}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {currentModule.title}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Module {currentModule.moduleNumber}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-600 max-w-3xl">
                                {currentModule.description}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lessons List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Lessons
                        </h2>

                        <div className="space-y-3">
                            {currentModule.lessons.map((lesson, index) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(lesson.id)}
                                    className="w-full card hover:shadow-xl transition-all duration-200 text-left"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${lesson.completed
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {lesson.completed ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : (
                                                getLessonIcon(lesson.type)
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {lesson.title}
                                            </h3>
                                            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                                                <span className="capitalize">{lesson.type}</span>
                                                <span>•</span>
                                                <span>{Math.round(lesson.duration / 60)} min</span>
                                                {lesson.score !== undefined && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={lesson.score >= 70 ? 'text-green-600' : 'text-orange-600'}>
                                                            Score: {lesson.score}%
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {lesson.completed && (
                                            <div className="text-green-600 font-medium text-sm">
                                                Completed
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Module Progress
                            </h3>
                            <ProgressBar
                                current={currentModule.lessons.filter(l => l.completed).length}
                                total={currentModule.lessons.length}
                                showLabel={true}
                                label="Lessons Completed"
                            />
                        </div>

                        {/* Module Info */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Module Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Lessons</span>
                                    <span className="font-medium text-gray-900">
                                        {currentModule.lessons.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estimated Time</span>
                                    <span className="font-medium text-gray-900">
                                        {currentModule.estimatedTime} min
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="font-medium text-gray-900">
                                        {currentModule.lessons.filter(l => l.completed).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModuleView;
