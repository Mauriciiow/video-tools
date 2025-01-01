import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Music, StopCircle } from "lucide-react";
import { useGetMusicDetails } from "@/use-case/use-get-music-details";
import { convertDate } from "@/utils/convert-date";

export default function MusicRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const {
    mutate: getMusicDetails,
    isPending: isRecognizing,
    data: recognitionResult,
  } = useGetMusicDetails();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setProgress((prevProgress) => (prevProgress + 1) % 101);
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const recognizeMusic = async () => {
    if (!audioBlob) return;

    getMusicDetails(audioBlob);
  };

  console.log(recognitionResult);

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">
          Reconhecimento de Música
        </h1>
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="space-y-6">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className="w-full"
              variant={isRecording ? "destructive" : "purpleGradient"}
            >
              {isRecording ? (
                <>
                  Parar Gravação
                  <StopCircle className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Iniciar Gravação
                  <Mic className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            {isRecording && (
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="w-full h-2 bg-gray-700"
                  indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                />
                <p className="text-sm text-center text-gray-300 font-semibold">
                  Gravando...
                </p>
              </div>
            )}
            {audioBlob && !isRecording && (
              <Button
                onClick={recognizeMusic}
                disabled={isRecognizing || !!recognitionResult}
                className="w-full"
                variant="greenGradient"
              >
                {isRecognizing ? "Reconhecendo..." : "Reconhecer Música"}
                <Music className="ml-2 h-5 w-5" />
              </Button>
            )}
            {recognitionResult && (
              <div className="mt-4 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-gray-200">
                  Resultado:
                </h2>
                {recognitionResult.artist ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      {recognitionResult.spotify?.album?.images?.[0]?.url && (
                        <img
                          src={recognitionResult.spotify.album.images[0].url}
                          alt="Placeholder"
                          style={{ width: "100px", height: "100px" }}
                        />
                      )}
                      <div>
                        <p className="text-gray-300 font-semibold">
                          {recognitionResult.title}
                        </p>
                        <p className="text-gray-400">
                          {recognitionResult.artist}
                        </p>
                        <p className="text-gray-400">
                          {recognitionResult.album}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-300">
                        <strong>Data de lançamento:</strong>{" "}
                        {convertDate(recognitionResult.release_date)}
                      </p>
                      <p className="text-gray-300">
                        <strong>Gravadora:</strong> {recognitionResult.label}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      {recognitionResult.apple_music?.url && (
                        <a
                          href={recognitionResult.apple_music.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Abrir no Apple Music
                        </a>
                      )}
                      {recognitionResult.spotify?.external_urls?.spotify && (
                        <a
                          href={recognitionResult.spotify.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:underline"
                        >
                          Abrir no Spotify
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">Música não reconhecida.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
