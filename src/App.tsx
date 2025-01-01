import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Music, Scissors, ArrowLeft } from "lucide-react";
import VideoToAudio from "./pages/video-to-audio";
import VideoCutter from "./pages/video-cutter";
import MusicRecognition from "./pages/music-recognition";
export default function Home() {
  const [selectedTool, setSelectedTool] = useState<
    "convert" | "cut" | "recognize" | null
  >(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {!selectedTool ? (
          <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">
              Vídeo Tools
            </h1>
            <div className="space-y-6">
              <Button
                onClick={() => setSelectedTool("convert")}
                className="w-full"
                variant="purpleGradient"
              >
                Converter Vídeo para Áudio
                <Music className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => setSelectedTool("cut")}
                className="w-full"
                variant="greenGradient"
              >
                Cortar Vídeo
                <Scissors className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => setSelectedTool("recognize")}
                className="w-full"
                variant="blueGradient"
              >
                Reconhecer Música
                <Music className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {selectedTool === "convert" && <VideoToAudio />}
            {selectedTool === "cut" && <VideoCutter />}
            {selectedTool === "recognize" && <MusicRecognition />}
            <Button
              onClick={() => setSelectedTool(null)}
              className="mt-4 w-full text-white gap-2"
              variant="link"
            >
              <ArrowLeft className="ml-2 h-5 w-5" />
              Voltar para a seleção de ferramentas
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
