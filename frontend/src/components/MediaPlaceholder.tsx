import React from 'react';
import { Image, Video, Music } from 'lucide-react';

interface MediaPlaceholderProps {
    type: 'image' | 'audio' | 'video';
    description: string;
    timingInfo?: string;
    dimensions?: string;
}

const MediaPlaceholder: React.FC<MediaPlaceholderProps> = ({
    type,
    description,
    timingInfo,
    dimensions
}) => {
    const getIcon = () => {
        switch (type) {
            case 'video':
                return <Video className="w-16 h-16 text-gray-500" />;
            case 'image':
                return <Image className="w-16 h-16 text-gray-500" />;
            case 'audio':
                return <Music className="w-16 h-16 text-gray-500" />;
        }
    };

    const getClassName = () => {
        switch (type) {
            case 'video':
                return 'media-placeholder-video';
            case 'image':
                return 'media-placeholder-image';
            case 'audio':
                return 'media-placeholder-audio';
        }
    };

    return (
        <div className={`${getClassName()} flex-col space-y-3`}>
            {getIcon()}
            <div className="text-center space-y-2">
                <p className="font-semibold text-gray-700 uppercase text-sm tracking-wide">
                    [{type.toUpperCase()} PLACEHOLDER]
                </p>
                <p className="text-sm text-gray-600 max-w-md">
                    {description}
                </p>
                {timingInfo && (
                    <p className="text-xs text-gray-500 font-mono">
                        {timingInfo}
                    </p>
                )}
                {dimensions && (
                    <p className="text-xs text-gray-400">
                        {dimensions}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MediaPlaceholder;
