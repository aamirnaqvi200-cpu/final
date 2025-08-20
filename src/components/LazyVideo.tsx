import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface LazyVideoProps {
  src: string;
  title: string;
  isShowreel?: boolean;
  className?: string;
  aspectRatio?: 'video' | 'vertical';
}

export function LazyVideo({ src, title, isShowreel = false, className = '', aspectRatio = 'video' }: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const aspectClasses = aspectRatio === 'vertical' ? 'aspect-[9/16]' : 'aspect-video';
  const playButtonSize = aspectRatio === 'vertical' 
    ? (isFullscreen ? 'w-20 h-20' : 'w-12 h-12')
    : (isFullscreen ? 'w-24 h-24' : 'w-16 h-16');
  const playTriangleSize = aspectRatio === 'vertical'
    ? (isFullscreen ? 'border-l-[24px] border-t-[14px] border-b-[14px]' : 'border-l-[12px] border-t-[8px] border-b-[8px]')
    : (isFullscreen ? 'border-l-[30px] border-t-[18px] border-b-[18px]' : 'border-l-[20px] border-t-[12px] border-b-[12px]');

  return (
    <div 
      ref={containerRef}
      className={`relative group cursor-pointer ${aspectClasses} rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] !rounded-none !aspect-auto w-screen h-screen' 
          : 'hover:shadow-xl hover:scale-105'
      } ${className}`}
      onClick={handleVideoClick}
    >
      {isInView ? (
        <video
          ref={videoRef}
          src={src}
          autoPlay={false}
          muted={false}
          loop={isShowreel}
          playsInline
          preload="metadata"
          className={`w-full h-full transition-opacity duration-300 ${
            isFullscreen ? 'object-contain' : 'object-cover'
          }`}
          onLoadedData={() => setIsLoaded(true)}
          poster={`${src}#t=1`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 animate-pulse" />
      )}
      
      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className={`bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm ${playButtonSize}`}>
            <div className={`w-0 h-0 border-l-white border-t-transparent border-b-transparent ml-1 ${playTriangleSize} ${
              !isFullscreen && aspectRatio === 'video' ? 'animate-bounce-triangle' : ''
            }`}></div>
          </div>
        </div>
      )}
      
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className={`absolute bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
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
      
      <div className={`absolute transition-all duration-300 ${
        isFullscreen 
          ? 'bottom-8 left-8 opacity-100' 
          : 'bottom-4 left-4 opacity-0 group-hover:opacity-100'
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