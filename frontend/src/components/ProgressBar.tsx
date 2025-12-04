import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
    current: number;
    total: number;
    showPercentage?: boolean;
    showLabel?: boolean;
    label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    showPercentage = true,
    showLabel = false,
    label
}) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <div className="w-full space-y-2">
            {showLabel && label && (
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-gray-600">
                        {current} / {total}
                    </span>
                </div>
            )}

            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {showPercentage && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{percentage}% Complete</span>
                    {percentage === 100 && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
