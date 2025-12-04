import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import { quizAPI } from '../api/client';
import { ArrowLeft, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import MediaPlaceholder from '../components/MediaPlaceholder';
import VideoScriptViewer from '../components/VideoScriptViewer';
import QuizInterface from '../components/QuizInterface';
import ReactMarkdown from 'react-markdown';

const LessonView: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const { currentLesson, fetchLesson, completeLesson, isLoading } = useCourseStore();
    const [quizId, setQuizId] = useState<number | null>(null);

    useEffect(() => {
        if (lessonId) {
            fetchLesson(parseInt(lessonId));
            loadQuizIfNeeded(parseInt(lessonId));
        }
    }, [lessonId]);

    const loadQuizIfNeeded = async (lessonIdNum: number) => {
        try {
            // Try to fetch quiz for this lesson
            const response = await quizAPI.getQuiz(lessonIdNum);
            if (response.data) {
                setQuizId(response.data.id);
            }
        } catch (err) {
            // No quiz for this lesson, that's okay
            setQuizId(null);
        }
    };

    const handleComplete = async () => {
        if (lessonId && currentLesson) {
            await completeLesson(parseInt(lessonId));
            // Navigate back to module view
            navigate(`/modules/${currentLesson.moduleId}`);
        }
    };

    const handleQuizComplete = () => {
        // Quiz completion is handled by QuizInterface
        // Just refresh the lesson to update progress
        if (lessonId) {
            fetchLesson(parseInt(lessonId));
        }
    };

    if (isLoading || !currentLesson) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const isCompleted = currentLesson.progress?.completed || false;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(`/modules/${currentLesson.moduleId}`)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Module</span>
                        </button>

                        {isCompleted && (
                            <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Completed</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Lesson Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentLesson.title}
                    </h1>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="capitalize">{currentLesson.type}</span>
                        <span>•</span>
                        <span>{Math.round(currentLesson.duration / 60)} minutes</span>
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="space-y-8">
                    {/* Video Lesson */}
                    {currentLesson.type === 'video' && (
                        <>
                            {/* Media Placeholders */}
                            {currentLesson.mediaPlaceholders.map((media, index) => (
                                <MediaPlaceholder
                                    key={media.id}
                                    type={media.type}
                                    description={media.description}
                                    timingInfo={media.timingInfo}
                                    dimensions={media.dimensions}
                                />
                            ))}

                            {/* Video Script */}
                            {currentLesson.content && (
                                <VideoScriptViewer
                                    content={currentLesson.content}
                                    title={currentLesson.title}
                                />
                            )}
                        </>
                    )}

                    {/* Reading Lesson */}
                    {currentLesson.type === 'reading' && (
                        <div className="card">
                            <div className="prose max-w-none">
                                <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Quiz Lesson */}
                    {currentLesson.type === 'quiz' && quizId && (
                        <QuizInterface
                            quizId={quizId}
                            lessonId={currentLesson.id}
                            onComplete={handleQuizComplete}
                        />
                    )}

                    {/* Interactive Lesson (Future) */}
                    {currentLesson.type === 'interactive' && (
                        <div className="card">
                            <p className="text-gray-600">
                                Interactive lesson content coming soon...
                            </p>
                        </div>
                    )}
                </div>

                {/* Completion Button */}
                {!isCompleted && currentLesson.type !== 'quiz' && (
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleComplete}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <span>Mark as Complete</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {isCompleted && currentLesson.type !== 'quiz' && (
                    <div className="mt-8 card bg-green-50 border-2 border-green-200">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-900">
                                    Lesson Completed!
                                </p>
                                <p className="text-sm text-green-700">
                                    Great job! Continue to the next lesson.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LessonView;
