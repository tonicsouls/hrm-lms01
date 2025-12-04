import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';

interface VideoScriptViewerProps {
    content: string;
    title: string;
}

const VideoScriptViewer: React.FC<VideoScriptViewerProps> = ({ content, title }) => {
    const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set([0]));

    // Parse scenes from content
    const scenes = parseScenes(content);

    const toggleScene = (index: number) => {
        setExpandedScenes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                    <Play className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                <p className="text-purple-100">
                    Video script with scene breakdowns and timing information
                </p>
            </div>

            {scenes.length > 0 ? (
                <div className="space-y-4">
                    {scenes.map((scene, index) => (
                        <div key={index} className="card">
                            <button
                                className="w-full flex items-center justify-between text-left"
                                onClick={() => toggleScene(index)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className="text-sm font-mono text-gray-500">
                                            {scene.timing}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {scene.title}
                                        </h3>
                                    </div>
                                </div>
                                {expandedScenes.has(index) ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {expandedScenes.has(index) && (
                                <div className="mt-4 space-y-4 animate-slide-up">
                                    {scene.visuals.length > 0 && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                                📹 VISUAL
                                            </p>
                                            <div className="space-y-2">
                                                {scene.visuals.map((visual, vIndex) => (
                                                    <p key={vIndex} className="text-sm text-gray-700">
                                                        {visual}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {scene.narration.length > 0 && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-green-900 mb-2">
                                                🎙️ NARRATOR
                                            </p>
                                            <div className="space-y-2">
                                                {scene.narration.map((narr, nIndex) => (
                                                    <p key={nIndex} className="text-sm text-gray-700 italic">
                                                        "{narr}"
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {scene.onScreenText.length > 0 && (
                                        <div className="bg-yellow-50 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-yellow-900 mb-2">
                                                💬 ON-SCREEN TEXT
                                            </p>
                                            <div className="space-y-2">
                                                {scene.onScreenText.map((text, tIndex) => (
                                                    <p key={tIndex} className="text-sm text-gray-700 font-medium">
                                                        {text}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="prose max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to parse scenes from markdown content
function parseScenes(content: string) {
    const scenes: Array<{
        title: string;
        timing: string;
        visuals: string[];
        narration: string[];
        onScreenText: string[];
    }> = [];

    // Match scene sections with timing
    const sceneRegex = /\*\*\((\d+:\d+)\s*-\s*(\d+:\d+)\)\s*-\s*([^*]+)\*\*/g;
    const matches = [...content.matchAll(sceneRegex)];

    matches.forEach((match, index) => {
        const startTime = match[1];
        const endTime = match[2];
        const title = match[3].trim();
        const timing = `${startTime} - ${endTime}`;

        // Find scene content
        const sceneStart = match.index!;
        const nextSceneStart = matches[index + 1]?.index ?? content.length;
        const sceneContent = content.substring(sceneStart, nextSceneStart);

        // Extract visuals
        const visualRegex = /\*\*VISUAL:\*\*\s*([^\n]+)/g;
        const visuals = [...sceneContent.matchAll(visualRegex)].map(m => m[1].trim());

        // Extract narration
        const narratorRegex = /\*\*NARRATOR[^:]*:\*\*\s*([^\n]+)/g;
        const narration = [...sceneContent.matchAll(narratorRegex)].map(m =>
            m[1].trim().replace(/^["']|["']$/g, '')
        );

        // Extract on-screen text
        const onScreenRegex = /\*\*ON-SCREEN TEXT:\*\*\s*\*([^*]+)\*/g;
        const onScreenText = [...sceneContent.matchAll(onScreenRegex)].map(m => m[1].trim());

        scenes.push({
            title,
            timing,
            visuals,
            narration,
            onScreenText
        });
    });

    return scenes;
}

export default VideoScriptViewer;
