import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, Scissors } from "lucide-react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FileInput } from "@/components/file-input";
import { convertToMinutes } from "@/utils/convert-minutes";
import { downloadFile } from "@/utils/download";

export default function VideoCutter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [converted, setConverted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ffmpeg = createFFmpeg({ log: true });

  useEffect(() => {
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(videoUrl);
    }
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setConverted(false);
      setStartTime(0);
      setEndTime(0);
    }
  };

  const handleConvert = async (videoFile: File) => {
    if (!videoFile) return;

    const fileName = videoFile.name;

    try {
      setConverting(true);
      setProgress(0);

      await ffmpeg.load();

      ffmpeg.FS("writeFile", fileName, await fetchFile(videoFile));

      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.round(ratio * 100));
      });

      const outputFileName = `${fileName.split(".")[0]}_cut.mp4`;

      await ffmpeg.run(
        "-ss",
        convertToMinutes(startTime),
        "-i",
        fileName,
        "-to",
        convertToMinutes(endTime),
        "-c",
        "copy",
        outputFileName
      );

      const data = ffmpeg.FS("readFile", outputFileName);

      const videoBlob = new Blob([data.buffer], { type: "video/mp4" });

      downloadFile(videoBlob, `${fileName.split(".")[0]}_cut.mp4`);

      setConverted(true);
      setConverting(false);
    } catch (error) {
      console.error("Erro durante o corte:", error);
      setConverting(false);
    }
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
      setConverted(false);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
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
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  className="w-full rounded-lg"
                  controls
                  onLoadedMetadata={handleVideoLoad}
                />
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Cortar vídeo:</p>
                  <Slider
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={[startTime, endTime]}
                    onValueChange={(value) => {
                      setStartTime(value[0]);
                      setEndTime(value[1]);
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{convertToMinutes(startTime)}</span>
                    <span>{convertToMinutes(endTime)}</span>
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={() => handleConvert(file as File)}
              disabled={!file || converting}
              className="w-full"
              variant="purpleGradient"
            >
              {converting ? "Processando..." : "Cortar Vídeo"}
              {!converting && <Scissors className="ml-2 h-5 w-5" />}
            </Button>
            {converting && (
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
            {converted && (
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
