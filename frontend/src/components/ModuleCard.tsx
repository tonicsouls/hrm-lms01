import React from 'react';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

interface ModuleCardProps {
    id: number;
    moduleNumber: number;
    title: string;
    description: string;
    estimatedTime: number;
    lessonCount: number;
    completedCount: number;
    progress: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
    id,
    moduleNumber,
    title,
    description,
    estimatedTime,
    lessonCount,
    completedCount,
    progress
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/modules/${id}`);
    };

    const isCompleted = progress === 100;

    return (
        <div
            className="card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            onClick={handleClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {moduleNumber}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500">Module {moduleNumber}</p>
                    </div>
                </div>
                {isCompleted && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
                {description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{lessonCount} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{estimatedTime} min</span>
                </div>
            </div>

            <ProgressBar
                current={completedCount}
                total={lessonCount}
                showLabel={false}
            />

            <button
                className={`mt-4 w-full ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
            >
                {progress === 0 ? 'Start Module' : isCompleted ? 'Review' : 'Continue'}
            </button>
        </div>
    );
};

export default ModuleCard;
