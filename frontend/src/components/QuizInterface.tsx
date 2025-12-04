import React, { useState, useEffect } from 'react';
import { quizAPI } from '../api/client';
import { CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';

interface QuizInterfaceProps {
    quizId: number;
    lessonId: number;
    onComplete?: () => void;
}

interface Question {
    id: string;
    question: string;
    options: string[];
}

interface QuizResult {
    score: number;
    passed: boolean;
    passingScore: number;
    correctCount: number;
    totalQuestions: number;
    attemptNumber: number;
    feedback: Array<{
        questionId: string;
        question: string;
        options: string[];
        userAnswer: number;
        correctAnswer: number;
        isCorrect: boolean;
        rationale: string;
    }>;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizId, lessonId, onComplete }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await quizAPI.getQuiz(quizId);
            setQuestions(response.data.questions);
            setAnswers({});
            setResult(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load quiz');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: string, optionIndex: number) => {
        if (result) return; // Don't allow changes after submission

        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            setError('Please answer all questions before submitting');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await quizAPI.submitQuiz(quizId, answers);
            setResult(response.data);

            if (response.data.passed && onComplete) {
                onComplete();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setResult(null);
        setError(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error && !result) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-2">Quiz Time!</h2>
                <p className="text-primary-100">
                    Test your understanding of this module
                </p>
            </div>

            {/* Results Summary */}
            {result && (
                <div className={`card ${result.passed ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Score: {result.score}%
                            </h3>
                            <p className="text-gray-600">
                                {result.correctCount} out of {result.totalQuestions} correct
                            </p>
                        </div>
                        {result.passed ? (
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-orange-600" />
                        )}
                    </div>

                    <p className={`text-sm ${result.passed ? 'text-green-800' : 'text-orange-800'}`}>
                        {result.passed
                            ? `Congratulations! You passed with a score of ${result.score}%.`
                            : `You need ${result.passingScore}% to pass. Review the material and try again.`
                        }
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                        Attempt #{result.attemptNumber}
                    </p>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
                {questions.map((question, qIndex) => {
                    const userAnswer = answers[question.id];
                    const feedback = result?.feedback.find(f => f.questionId === question.id);

                    return (
                        <div key={question.id} className="card">
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                                    {qIndex + 1}
                                </div>
                                <p className="text-lg font-medium text-gray-900 flex-1">
                                    {question.question}
                                </p>
                                {feedback && (
                                    feedback.isCorrect ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    )
                                )}
                            </div>

                            <div className="space-y-2">
                                {question.options.map((option, optIndex) => {
                                    const isSelected = userAnswer === optIndex;
                                    const isCorrect = feedback?.correctAnswer === optIndex;
                                    const isUserWrong = feedback && isSelected && !feedback.isCorrect;

                                    let className = 'quiz-option';
                                    if (result) {
                                        if (isCorrect) {
                                            className += ' quiz-option-correct';
                                        } else if (isUserWrong) {
                                            className += ' quiz-option-incorrect';
                                        }
                                    } else if (isSelected) {
                                        className += ' quiz-option-selected';
                                    }

                                    return (
                                        <button
                                            key={optIndex}
                                            className={className}
                                            onClick={() => handleAnswerSelect(question.id, optIndex)}
                                            disabled={!!result}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                                                    }`}>
                                                    {isSelected && (
                                                        <div className="w-3 h-3 bg-white rounded-full" />
                                                    )}
                                                </div>
                                                <span className="text-left">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Rationale */}
                            {feedback && (
                                <div className={`mt-4 p-4 rounded-lg ${feedback.isCorrect ? 'bg-green-50' : 'bg-blue-50'
                                    }`}>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">
                                        {feedback.isCorrect ? '✓ Correct!' : 'Explanation:'}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        {feedback.rationale}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                {result ? (
                    <>
                        <button
                            className="btn-outline flex items-center space-x-2"
                            onClick={handleRetry}
                        >
                            <RotateCcw className="w-5 h-5" />
                            <span>Retry Quiz</span>
                        </button>
                        {result.passed && onComplete && (
                            <button
                                className="btn-primary"
                                onClick={onComplete}
                            >
                                Continue to Next Lesson
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-600">
                            {Object.keys(answers).length} / {questions.length} answered
                        </p>
                        <button
                            className="btn-primary flex items-center space-x-2"
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <span>Submit Quiz</span>
                            )}
                        </button>
                    </>
                )}
            </div>

            {error && result && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default QuizInterface;
