import React, { useRef, useState, useEffect } from "react";
import { Maximize2, X, Play, Pause } from "lucide-react";
import { useVideoSequence } from './VideoSequenceManager';

// Check if device is mobile
const isMobile = () => window.innerWidth < 768;

interface VideoThumbnailProps {
  src: string;
  title: string;
  aspectRatio?: "video" | "vertical";
  className?: string;
  isShowreel?: boolean;
  videoIndex?: number;
}

export function VideoThumbnail({
  src, 
  title,
  aspectRatio = "video",
  className = "",
  isShowreel = false,
  videoIndex = -1,
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const { currentVideoIndex, isSequenceActive, nextVideo } = useVideoSequence();
  const shouldAutoPlay = isSequenceActive && currentVideoIndex === videoIndex;

  const aspectClasses = aspectRatio === "vertical" ? "aspect-[9/16]" : "aspect-video";

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Load video when in view but don't autoplay
  useEffect(() => {
    if (isInView && videoRef.current && !videoLoaded) {
      const video = videoRef.current;
      video.src = src;
      video.load();
    }
  }, [isInView, src, videoLoaded]);

  // Auto-play when it's this video's turn in the sequence
  useEffect(() => {
    if (shouldAutoPlay && videoRef.current && videoLoaded && !isPlaying) {
      const playVideo = async () => {
        try {
          setIsLoading(true);
          await videoRef.current!.play();
          setIsPlaying(true);
          setIsLoading(false);
        } catch (error) {
          console.error('Error auto-playing video:', error);
          setIsLoading(false);
          // Move to next video if this one fails
          setTimeout(nextVideo, 1000);
        }
      };
      playVideo();
    }
  }, [shouldAutoPlay, videoLoaded, isPlaying, nextVideo]);

  // Handle video end during sequence
  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (isSequenceActive && currentVideoIndex === videoIndex) {
      // Wait a moment before moving to next video
      setTimeout(nextVideo, 500);
    }
  };

  const handleClick = async () => {
    if (!videoRef.current) return;
    setHasInteracted(true);

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error playing video:', error);
        setIsLoading(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen();
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const playButtonSize = aspectRatio === 'vertical' 
    ? (isFullscreen ? 'w-20 h-20' : 'w-12 h-12')
    : (isFullscreen ? 'w-24 h-24' : 'w-16 h-16');

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer ${aspectClasses} rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] !rounded-none !aspect-auto w-screen h-screen bg-black' 
          : (isMobile() ? '' : 'hover:shadow-xl hover:scale-105')
      } ${className}`}
      onClick={handleClick}
    >
      {/* Single video element that handles both preview and playback */}
      {isInView && (
        <video 
          ref={videoRef}
          className={`absolute inset-0 w-full h-full ${
            isFullscreen ? 'object-contain' : 'object-cover'
          } transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          loop={isShowreel}
          playsInline
          preload="metadata" // Only load metadata for thumbnail
          onLoadedData={() => {
            setVideoLoaded(true);
            // Seek to 1 second for better thumbnail
            if (videoRef.current && !hasInteracted) { 
              videoRef.current.currentTime = 0;
            }
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsLoading(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnd}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedMetadata={() => {
            // Seek to 1 second for better thumbnail, but only if not in sequence
            if (!isSequenceActive && !hasInteracted && videoRef.current) {
              videoRef.current.currentTime = 1;
            }
          }}
          onError={() => {
            setIsLoading(false);
            console.error('Video failed to load:', src);
            // Move to next video if this one fails during sequence
            if (isSequenceActive && currentVideoIndex === videoIndex) {
              setTimeout(nextVideo, 1000);
            }
          }}
        />
      )}

      {/* Fallback background when video is loading */}
      {!videoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-white/40 text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bosenAlt">LOADING</p>
          </div>
        </div>
      )}

      {/* Play/Pause button overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className={`bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${playButtonSize} ${
          isLoading ? 'animate-pulse' : (isMobile() ? '' : 'group-hover:bg-white/30')
        } ${isPlaying && !isLoading && !shouldAutoPlay ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} ${
          shouldAutoPlay ? 'ring-2 ring-cyan-400 ring-opacity-60' : ''
        }`}>
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className={`text-white ${
              aspectRatio === 'vertical' 
                ? (isFullscreen ? 'w-8 h-8' : 'w-5 h-5')
                : (isFullscreen ? 'w-10 h-10' : 'w-6 h-6')
            }`} />
          ) : (
            <Play className={`text-white ml-1 ${
              aspectRatio === 'vertical' 
                ? (isFullscreen ? 'w-8 h-8' : 'w-5 h-5')
                : (isFullscreen ? 'w-10 h-10' : 'w-6 h-6')
            }`} />
          )}
        </div>
      </div>

      {/* Sequence indicator */}
      {shouldAutoPlay && (
        <div className="absolute top-2 left-2 z-30">
          <div className="bg-cyan-400 text-black px-2 py-1 rounded-full text-xs font-bosenAlt animate-pulse">
            NOW PLAYING
          </div>
        </div>
      )}

      {/* Hover overlay */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      )}
      
      {/* Fullscreen button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className={`absolute bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
          isFullscreen 
            ? 'top-8 right-8 w-12 h-12 opacity-100' 
            : 'top-4 right-4 w-10 h-10 opacity-0 group-hover:opacity-100'
        }`}
      >
        {isFullscreen ? (
          <X size={20} className="text-white" />
        ) : (
          <Maximize2 size={16} className="text-white" />
        )}
      </button>
      
      {/* Title Badge */}
      <div className={`absolute transition-all duration-300 z-20 ${
        isFullscreen 
          ? 'bottom-8 left-8 opacity-100' 
          : `bottom-4 left-4 ${shouldAutoPlay ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`
      }`}>
        <span className={`text-white font-bosenAlt bg-black/50 px-3 py-1 rounded-full ${
          isFullscreen ? 'text-lg' : 'text-sm'
        }`}>
          {title}
        </span>
      </div>
    </div>
  );
}

// Export the total number of videos for the sequence manager
export const TOTAL_VIDEOS = 22; // 1 showreel + 9 featured + 12 social

export default VideoThumbnail;