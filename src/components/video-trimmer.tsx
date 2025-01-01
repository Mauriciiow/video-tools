import React, { useRef, useState, useEffect } from "react";
import { clamp, motion } from "framer-motion";
import { formatTime } from "@/utils/convert-minutes";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [videoState, setVideoState] = useState({
    duration: 0,
    frames: [] as string[],
    isDragging: null as "start" | "end" | null,
    isLoadingFrames: false,
    reachedEndTime: false,
  });

  useEffect(() => {
    const video = videoRef.current;
    const frameVideo = frameVideoRef.current;
    if (video && frameVideo) {
      video.addEventListener("loadedmetadata", () => {
        setVideoState((prev) => ({ ...prev, duration: video.duration }));
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
          setVideoState((prev) => ({ ...prev, reachedEndTime: true }));
        } else {
          setVideoState((prev) => ({ ...prev, reachedEndTime: false }));
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

    setVideoState((prev) => ({ ...prev, isLoadingFrames: true }));
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

    setVideoState((prev) => ({ ...prev, frames, isLoadingFrames: false }));
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
    setVideoState((prev) => ({ ...prev, isDragging: type }));
  };

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!videoState.isDragging || !timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const x =
      "touches" in event
        ? event.touches[0].clientX - rect.left
        : event.clientX - rect.left;

    const newTime = clamp(
      0,
      videoState.duration,
      (x / rect.width) * videoState.duration
    );

    const minGap = 0.25;

    if (videoState.isDragging === "start") {
      const clampedStart = Math.min(newTime, endTime - minGap);
      onTimeChange(clampedStart, endTime);
      updateMainVideoTime(clampedStart);
    } else if (videoState.isDragging === "end") {
      const clampedEnd = Math.max(newTime, startTime + minGap);
      onTimeChange(startTime, clampedEnd);
      updateMainVideoTime(clampedEnd);
    }
  };

  const handleMouseUp = () => {
    setVideoState((prev) => ({ ...prev, isDragging: null }));
  };
  const handleEnd = () => {
    setVideoState((prev) => ({ ...prev, isDragging: null }));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          className="w-full rounded-lg"
          controls
          onPlay={() =>
            setVideoState((prev) => ({ ...prev, reachedEndTime: false }))
          }
        />
        {videoState.reachedEndTime && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = startTime;
                  videoRef.current.play();
                  setVideoState((prev) => ({ ...prev, reachedEndTime: false }));
                }
              }}
            >
              Reproduzir novamente
            </Button>
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
        className={`relative h-32 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-inner ${
          videoState.isLoadingFrames ? "cursor-wait" : "cursor-grab"
        }`}
        onMouseMove={handleMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {videoState.isLoadingFrames ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="ml-2 text-white font-medium">Carregando frames...</p>
          </div>
        ) : (
          <div className="absolute top-0 bottom-0 left-0 right-0 flex">
            {videoState.frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index}`}
                draggable={false}
                className="h-full object-cover flex-grow cursor-default select-none"
              />
            ))}
          </div>
        )}
        <motion.div
          className="absolute top-0 bottom-0 bg-purple-500 opacity-30"
          style={{
            left: `${(startTime / videoState.duration) * 100}%`,
            right: `${100 - (endTime / videoState.duration) * 100}%`,
          }}
        />
        <motion.div
          className={`absolute top-0 bottom-0 w-1 bg-white ${
            videoState.isDragging === "start" ? "bg-blue-500" : ""
          } cursor-ew-resize`}
          style={{
            left: `calc(${
              (startTime / videoState.duration) * 100
            }% + 0.125rem)`,
          }}
          onMouseDown={(e) => handleTrimmerDrag(e, "start")}
          onTouchStart={(e) => handleTrimmerDrag(e, "start")}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-bold shadow">
              {formatTime(startTime)}
            </div>
          </div>
        </motion.div>
        <motion.div
          className={`absolute top-0 bottom-0 w-1 bg-white ${
            videoState.isDragging === "end" ? "bg-blue-500" : ""
          } cursor-ew-resize`}
          style={{
            left: `calc(${(endTime / videoState.duration) * 100}% - 0.125rem)`,
          }}
          onMouseDown={(e) => handleTrimmerDrag(e, "end")}
          onTouchStart={(e) => handleTrimmerDrag(e, "end")}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-bold shadow">
              {formatTime(endTime)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoTrimmer;
