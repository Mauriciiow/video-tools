import { useState } from "'react'"
import { motion } from "'framer-motion'"
import { Button } from "@/components/ui/button"
import { Music, Scissors } from "'lucide-react'"
import VideoToAudio from "'./components/VideoToAudio'"
import VideoCutter from "'./components/VideoCutter'"

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<"'convert'" | "'cut'" | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">
          Toolkit de Vídeo
        </h1>
        {!selectedTool ? (
          <motion.div 
            className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="space-y-6">
              <Button
                onClick={() => setSelectedTool("'convert'")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-full transition duration-300 transform hover:scale-105"
              >
                Converter Vídeo para Áudio
                <Music className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => setSelectedTool("'cut'")}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 rounded-full transition duration-300 transform hover:scale-105"
              >
                Cortar Vídeo
                <Scissors className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {selectedTool === "'convert'" && <VideoToAudio />}
            {selectedTool === "'cut'" && <VideoCutter />}
            <Button
              onClick={() => setSelectedTool(null)}
              className="mt-4 w-full text-white"
              variant="outline"
            >
              Voltar para a seleção de ferramentas
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}

