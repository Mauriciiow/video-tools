import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/file-input";
import { FileIcon as FilePdf } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { downloadPdf } from "@/utils/download";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "primereact/toast";

export default function ImageToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show, toast } = useToast();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
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
    }
  };

  const convertToPDF = async () => {
    if (!file) return;

    try {
      setIsConverting(true);
      const pdfDoc = await PDFDocument.create();
      const imageBytes = await file.arrayBuffer();
      const mimeType = file.type;

      const image =
        mimeType === "image/jpeg" || mimeType === "image/jpg"
          ? await pdfDoc.embedJpg(imageBytes)
          : mimeType === "image/png"
          ? await pdfDoc.embedPng(imageBytes)
          : show("error", "Formato de imagem não suportado", "Use JPG ou PNG");

      if (!image) {
        setIsConverting(false);
        return;
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      const { width, height } = page.getSize();

      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });

      const pdfBytes = await pdfDoc.save();
      downloadPdf(pdfBytes, `${file.name.split(".")[0]}.pdf`);
    } catch (error) {
      show("error", "Erro", "Ocorreu um erro ao converter a imagem");
      console.error("Error converting image to PDF:", error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Toast ref={toast} position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">
          Converter Imagem para PDF
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
              acceptedFileTypes="image/*"
              fileIcon="image"
            />
            <Button
              onClick={convertToPDF}
              disabled={!file || isConverting}
              className="w-full"
              variant="purpleGradient"
            >
              {isConverting ? "Convertendo..." : "Converter para PDF"}
              <FilePdf className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
