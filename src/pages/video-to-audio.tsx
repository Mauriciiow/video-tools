import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useConvertVideoToAudio } from "@/use-case/use-convert";
import { FileInput } from "@/components/file-input";
import { CheckCircle, Music } from "lucide-react";
import { downloadFile } from "@/utils/download";

import socket from "@/api/socket";

export default function VideoToAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const {
    mutate: videoToAudio,
    isPending: isLoading,
    isSuccess,
  } = useConvertVideoToAudio();

  useEffect(() => {
    socket.on("progress", (progressPercent: number) => {
      setProgress(progressPercent);
    });
    return () => {
      socket.off("progress");
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    videoToAudio(file, {
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

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">
          Transforme Vídeo em Áudio
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
              acceptedFileTypes="video/*"
            />
            <Button
              onClick={handleConvert}
              disabled={!file || isLoading}
              className="w-full"
              variant="purpleGradient"
            >
              {isLoading ? "Convertendo..." : "Iniciar Conversão"}
              {!isLoading && <Music className="ml-2 h-5 w-5" />}
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
                  <span className="font-semibold">Conversão concluída!</span>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
