import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useVideoSequence } from './VideoSequenceManager';

export function SequenceControls() {
  const { isSequenceActive, currentVideoIndex, totalVideos, startSequence, resetSequence } = useVideoSequence();

  return (
    <div className="fixed top-8 right-8 z-50 flex flex-col gap-2">
      {/* Start/Stop Button */}
      <button
        onClick={isSequenceActive ? resetSequence : startSequence}
        className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300 flex items-center gap-2 shadow-lg"
      >
        {isSequenceActive ? (
          <>
            <Square size={16} />
            <span className="text-sm font-bosenAlt hidden sm:block">STOP PREVIEW</span>
          </>
        ) : (
          <>
            <Play size={16} />
            <span className="text-sm font-bosenAlt hidden sm:block">PREVIEW ALL</span>
          </>
        )}
      </button>

      {/* Progress Indicator */}
      {isSequenceActive && (
        <div className="bg-black/70 text-white rounded-full px-3 py-2 backdrop-blur-sm shadow-lg">
          <div className="text-xs font-bosenAlt text-center">
            VIDEO {currentVideoIndex + 1} OF {totalVideos}
          </div>
          <div className="w-16 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${((currentVideoIndex + 1) / totalVideos) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Reset Button */}
      {!isSequenceActive && currentVideoIndex !== -1 && (
        <button
          onClick={resetSequence}
          className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300 shadow-lg"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );
}