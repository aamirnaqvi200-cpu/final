import React, { useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";

interface VideoThumbnailProps {
  src: string;
  title: string;
  aspectRatio?: "video" | "vertical";
  className?: string;
}

export function VideoThumbnail({
  src,
  title,
  aspectRatio = "video",
  className = "",
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const aspectClasses =
    aspectRatio === "vertical" ? "aspect-[9/16]" : "aspect-video";

  const handleClick = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`relative group cursor-pointer ${aspectClasses} rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      {/* Video with thumbnail poster */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        playsInline
      />
 
      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm w-16 h-16">
            <div className="w-0 h-0 border-l-[20px] border-t-[12px] border-b-[12px] border-l-white border-t-transparent border-b-transparent ml-1 animate-bounce-triangle"></div>
          </div>
        </div>
      )}

      {/* Hover dark overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

      {/* Fullscreen button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className="absolute bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 z-10 top-4 right-4 w-10 h-10 opacity-0 group-hover:opacity-100"
      >
        {isFullscreen ? (
          <X size={16} className="text-white" />
        ) : (
          <Maximize2 size={16} className="text-white" />
        )}
      </button>

      {/* Title Badge */}
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span className="text-white font-bosenAlt bg-black/50 px-3 py-1 rounded-full text-sm">
          {title}
        </span>
      </div>
    </div>
  );
}

export default VideoThumbnail;