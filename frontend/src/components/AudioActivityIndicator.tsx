import React from 'react';
import { useAudioActivity } from '@/hooks/useAudioActivity';
import { Room } from 'livekit-client';

interface AudioActivityIndicatorProps {
  room: Room | null;
  className?: string;
}

export const AudioActivityIndicator: React.FC<AudioActivityIndicatorProps> = ({ 
  room, 
  className = '' 
}) => {
  const { isAgentSpeaking, audioLevel } = useAudioActivity(room);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
        isAgentSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
      }`} />
      
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-600">Audio:</span>
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ${
              isAgentSpeaking ? 'bg-green-500' : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(audioLevel, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-8">{audioLevel}%</span>
      </div>
      
      <span className={`text-sm font-medium ${
        isAgentSpeaking ? 'text-green-600' : 'text-gray-500'
      }`}>
        {isAgentSpeaking ? 'Agent đang nói' : 'Im lặng'}
      </span>
    </div>
  );
};