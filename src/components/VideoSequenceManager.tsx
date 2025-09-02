import React, { createContext, useContext, useState, useEffect } from 'react';

interface VideoSequenceContextType {
  currentVideoIndex: number;
  totalVideos: number;
  isSequenceActive: boolean;
  startSequence: () => void;
  nextVideo: () => void;
  resetSequence: () => void;
}

const VideoSequenceContext = createContext<VideoSequenceContextType | null>(null);

export function useVideoSequence() {
  const context = useContext(VideoSequenceContext);
  if (!context) {
    throw new Error('useVideoSequence must be used within VideoSequenceProvider');
  }
  return context;
}

interface VideoSequenceProviderProps {
  children: React.ReactNode;
  totalVideos: number;
}

export function VideoSequenceProvider({ children, totalVideos }: VideoSequenceProviderProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1); // -1 means not started
  const [isSequenceActive, setIsSequenceActive] = useState(false);

  const startSequence = () => {
    setCurrentVideoIndex(0);
    setIsSequenceActive(true);
  };

  const nextVideo = () => {
    setCurrentVideoIndex(prev => {
      const next = prev + 1;
      if (next >= totalVideos) {
        setIsSequenceActive(false);
        return -1; // Reset to not started
      }
      return next;
    });
  };

  const resetSequence = () => {
    setCurrentVideoIndex(-1);
    setIsSequenceActive(false);
  };

  return (
    <VideoSequenceContext.Provider value={{
      currentVideoIndex,
      totalVideos,
      isSequenceActive,
      startSequence,
      nextVideo,
      resetSequence
    }}>
      {children}
    </VideoSequenceContext.Provider>
  );
}