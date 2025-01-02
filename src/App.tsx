import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Music, Scissors, ArrowLeft, FileText } from "lucide-react";
import VideoToAudio from "./pages/video-to-audio";
import VideoCutter from "./pages/video-cutter";
import MusicRecognition from "./pages/music-recognition";
import ImageToPdf from "./pages/image-to-pdf";

export default function Home() {
  type Tool = "convert" | "cut" | "recognize" | "pdf" | null;
  interface Tools {
    name: string;
    icon: React.ElementType;
    tool: Tool;
    gradient:
      | "purpleGradient"
      | "blueGradient"
      | "greenGradient"
      | "redGradient";
  }
  const [selectedTool, setSelectedTool] = useState<Tool>(null);

  const tools: Tools[] = [
    {
      name: "Converter Vídeo para Áudio",
      icon: Music,
      tool: "convert",
      gradient: "purpleGradient",
    },
    {
      name: "Cortar Vídeo",
      icon: Scissors,
      tool: "cut",
      gradient: "blueGradient",
    },
    {
      name: "Reconhecer Música",
      icon: Music,
      tool: "recognize",
      gradient: "greenGradient",
    },
    {
      name: "Converter imagem para PDF",
      icon: FileText,
      tool: "pdf",
      gradient: "redGradient",
    },
  ];
  const iconClass = "ml-2 h-5 w-5";
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-between p-4">
      <div className="flex-1 w-full flex items-center justify-center">
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
                Tools
              </h1>
              <div className="space-y-6">
                {tools.map((item) => (
                  <Button
                    key={item.name}
                    onClick={() => setSelectedTool(item.tool)}
                    className="w-full"
                    variant={item.gradient}
                  >
                    {item.name}
                    <item.icon className={iconClass} />
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {selectedTool === "convert" && <VideoToAudio />}
              {selectedTool === "cut" && <VideoCutter />}
              {selectedTool === "recognize" && <MusicRecognition />}
              {selectedTool === "pdf" && <ImageToPdf />}
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

      {!selectedTool && (
        <footer className="text-gray-300 text-center mt-4">
          Feito por{" "}
          <a
            href="https://github.com/mauriciiow"
            target="_blank"
            className="underline"
          >
            @Maurício Oliveira
          </a>
        </footer>
      )}
    </div>
  );
}
