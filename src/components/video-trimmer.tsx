import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/utils/convert-minutes";

interface VideoTrimmerProps {
  src: string;
  onLoad: (duration: number) => void;
  onTimeChange: (start: number, end: number) => void;
  startTime: number;
  endTime: number;
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  src,
  onLoad,
  onTimeChange,
  startTime,
  endTime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const frameVideoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);
  const [isLoadingFrames, setIsLoadingFrames] = useState(false);
  const [reachedEndTime, setReachedEndTime] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const frameVideo = frameVideoRef.current;
    if (video && frameVideo) {
      video.addEventListener("loadedmetadata", () => {
        setDuration(video.duration);
        onLoad(video.duration);
      });
      frameVideo.addEventListener("loadedmetadata", () => {
        generateFrames();
      });
    }
  }, [src, onLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleTimeUpdate = () => {
        if (video.currentTime >= endTime) {
          video.pause();
          setReachedEndTime(true);
        } else {
          setReachedEndTime(false);
        }
      };
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [endTime]);

  const generateFrames = async () => {
    const video = frameVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsLoadingFrames(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameCount = 20;
    const interval = video.duration / frameCount;
    const frames: string[] = [];

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = i * interval;
      await new Promise((resolve) =>
        video.addEventListener("seeked", resolve, { once: true })
      );
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", 0.5));
    }

    setFrames(frames);
    setIsLoadingFrames(false);
  };

  const updateMainVideoTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleTrimmerDrag = (
    _: React.MouseEvent | React.TouchEvent,
    type: "start" | "end"
  ) => {
    setIsDragging(type);
  };

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const x =
      "touches" in event
        ? event.touches[0].clientX - rect.left
        : event.clientX - rect.left;

    const newTime = (x / rect.width) * duration;

    if (isDragging === "start") {
      onTimeChange(Math.min(newTime, endTime), endTime);
      updateMainVideoTime(Math.min(newTime, endTime));
    } else {
      onTimeChange(startTime, Math.max(newTime, startTime));
      updateMainVideoTime(Math.max(newTime, startTime));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleEnd = () => {
    setIsDragging(null);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          className="w-full rounded-lg"
          controls
          onPlay={() => setReachedEndTime(false)}
        />
        {reachedEndTime && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button
              className="bg-white text-black px-4 py-2 rounded-lg"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = startTime;
                  videoRef.current.play();
                  setReachedEndTime(false);
                }
              }}
            >
              Reproduzir novamente
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" width="160" height="90" />
      <video
        ref={frameVideoRef}
        src={src}
        className="hidden"
        preload="metadata"
      />
      <div
        ref={timelineRef}
        className={`relative h-24 bg-gray-700 rounded-lg overflow-hidden ${
          isLoadingFrames ? "cursor-wait" : "cursor-grab"
        }`}
        onMouseMove={handleMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {isLoadingFrames ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <p className="text-white">Carregando frames...</p>
          </div>
        ) : (
          <div className="absolute top-0 bottom-0 left-0 right-0 flex">
            {frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index}`}
                className="h-full object-cover flex-grow"
              />
            ))}
          </div>
        )}
        <motion.div
          className="absolute top-0 bottom-0 bg-purple-500 opacity-50"
          style={{
            left: `${(startTime / duration) * 100}%`,
            right: `${100 - (endTime / duration) * 100}%`,
          }}
        />
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `calc(${(startTime / duration) * 100}% - 0.125rem)` }}
          onMouseDown={(e) => handleTrimmerDrag(e, "start")}
          onTouchStart={(e) => handleTrimmerDrag(e, "start")}
        />
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `calc(${(endTime / duration) * 100}% - 0.125rem)` }}
          onMouseDown={(e) => handleTrimmerDrag(e, "end")}
          onTouchStart={(e) => handleTrimmerDrag(e, "end")}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-300">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>
    </div>
  );
};

export default VideoTrimmer;
