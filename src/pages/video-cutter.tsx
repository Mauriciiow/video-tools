import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { CheckCircle, Scissors } from "lucide-react";
import { FileInput } from "@/components/file-input";
import { convertToSeconds, formatTime } from "@/utils/convert-minutes";
import { useCutVideo } from "@/use-case/use-cut";
import { downloadFile } from "@/utils/download";
import socket from "@/api/socket";
import VideoTrimmer from "@/components/video-trimmer";

export default function VideoCutter() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: cutVideo, isPending: isLoading, isSuccess } = useCutVideo();

  useEffect(() => {
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(videoUrl);
      setStartTime(0);
      setEndTime(0);
    }
  }, [file]);

  useEffect(() => {
    socket.on("progress", (progressPercent: number) => {
      setProgress(progressPercent);
    });

    return () => {
      socket.off("progress");
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setStartTime(0);
      setEndTime(0);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    if (!endTime) return;

    const body = {
      video: file as File,
      startTime: startTime || 0,
      endTime,
    };

    cutVideo(body, {
      onSuccess: (data) => {
        downloadFile(data);
      },
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleVideoLoad = (duration: number) => {
    setVideoDuration(duration);
    setEndTime(duration);
  };

  const handleTimeChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(Math.min(end, videoDuration));
  };

  const handleInputChange = (type: "start" | "end", value: string) => {
    const formattedValue = value.replace(/[^\d]/g, "");

    const hours = formattedValue.slice(0, -4).padStart(2, "0");
    const minutes = formattedValue.slice(-4, -2).padStart(2, "0");
    const seconds = formattedValue.slice(-2).padStart(2, "0");

    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const totalSeconds = convertToSeconds(formattedTime);

    const clampedSeconds = Math.max(0, Math.min(totalSeconds, videoDuration));

    if (type === "start") {
      setStartTime(Math.min(clampedSeconds, endTime));
    } else {
      setEndTime(Math.max(clampedSeconds, startTime));
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">
          Corte seu Vídeo
        </h1>
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="space-y-6">
            <FileInput
              file={file}
              onChange={handleFileChange}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              fileInputRef={fileInputRef}
            />
            {videoPreviewUrl && (
              <div className="space-y-4">
                <VideoTrimmer
                  src={videoPreviewUrl || ""}
                  onLoad={handleVideoLoad}
                  onTimeChange={handleTimeChange}
                  startTime={startTime}
                  endTime={endTime}
                />
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="startTime"
                      className="text-sm text-gray-300"
                    >
                      Início:
                    </label>
                    <Input
                      id="startTime"
                      type="text"
                      value={formatTime(startTime)}
                      onChange={(e) =>
                        handleInputChange("start", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="endTime" className="text-sm text-gray-300">
                      Fim:
                    </label>
                    <Input
                      id="endTime"
                      type="text"
                      value={formatTime(endTime)}
                      onChange={(e) => handleInputChange("end", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={handleConvert}
              disabled={!file || isLoading}
              className="w-full"
              variant="purpleGradient"
            >
              {isLoading ? "Processando..." : "Cortar Vídeo"}
              {!isLoading && <Scissors className="ml-2 h-5 w-5" />}
            </Button>
            {isLoading && (
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="w-full h-2 bg-gray-700"
                  indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                />
                <p className="text-sm text-center text-gray-300 font-semibold">
                  {progress}% concluído
                </p>
              </div>
            )}
            {isSuccess && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center text-green-400 bg-gray-700 bg-opacity-50 p-4 rounded-full"
                >
                  <CheckCircle className="mr-2 h-6 w-6" />
                  <span className="font-semibold">
                    Vídeo cortado com sucesso!
                  </span>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
