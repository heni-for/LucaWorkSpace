'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  audioLevel: number;
  isRecording: boolean;
  className?: string;
}

export function AudioVisualizer({ audioLevel, isRecording, className }: AudioVisualizerProps) {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const height = Math.max(2, (audioLevel / 255) * 100 * Math.random());
    const delay = i * 50;
    
    return (
      <div
        key={i}
        className={cn(
          "w-1 bg-gradient-to-t from-blue-500 to-green-400 rounded-full transition-all duration-150",
          isRecording ? "opacity-100" : "opacity-30"
        )}
        style={{
          height: `${height}%`,
          animationDelay: `${delay}ms`,
          animation: isRecording ? `pulse 0.5s ease-in-out infinite alternate` : 'none'
        }}
      />
    );
  });

  return (
    <div className={cn("flex items-end justify-center gap-1 h-16", className)}>
      {bars}
    </div>
  );
}

interface MicrophoneStatusProps {
  isRecording: boolean;
  audioLevel: number;
  isProcessing: boolean;
  className?: string;
}

export function MicrophoneStatus({ isRecording, audioLevel, isProcessing, className }: MicrophoneStatusProps) {
  const getStatusColor = () => {
    if (isProcessing) return 'bg-blue-500';
    if (isRecording && audioLevel > 10) return 'bg-green-500';
    if (isRecording) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording && audioLevel > 10) return 'Listening';
    if (isRecording) return 'Ready';
    return 'Offline';
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-3 h-3 rounded-full transition-all duration-300",
          getStatusColor(),
          isRecording && audioLevel > 10 && "animate-pulse"
        )} />
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Level: {Math.round(audioLevel)}%
      </div>
    </div>
  );
}

interface AudioControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onLanguageChange: (language: string) => void;
  selectedLanguage: string;
  audioLevel: number;
  isProcessing: boolean;
  className?: string;
}

export function AudioControls({ 
  isRecording, 
  onToggleRecording, 
  onLanguageChange, 
  selectedLanguage, 
  audioLevel, 
  isProcessing,
  className 
}: AudioControlsProps) {
  const languages = [
    { code: 'ar-TN', name: 'Derja', flag: '🇹🇳' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Audio Visualizer */}
      <div className="bg-card/50 rounded-lg p-4">
        <div className="text-sm font-medium mb-3">Audio Input</div>
        <AudioVisualizer 
          audioLevel={audioLevel} 
          isRecording={isRecording}
          className="mb-3"
        />
        <MicrophoneStatus 
          isRecording={isRecording}
          audioLevel={audioLevel}
          isProcessing={isProcessing}
        />
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggleRecording}
          disabled={isProcessing}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-green-500 hover:bg-green-600 text-white",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isRecording ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Stop Recording
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-white rounded-full" />
              Start Recording
            </>
          )}
        </button>

        {/* Language Selector */}
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={cn(
                "px-3 py-1 rounded-md text-sm transition-all duration-200",
                selectedLanguage === lang.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
