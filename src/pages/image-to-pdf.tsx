import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/file-input";
import { FileIcon as FilePdf, X, GripVertical } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { downloadPdf } from "@/utils/download";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "primereact/toast";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";

interface SortableListProps {
  items: File[];
}

export default function ImageToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show, toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
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

    if (event.dataTransfer.files) {
      setFiles([...files, ...Array.from(event.dataTransfer.files)]);
    }
  };

  const handleSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    setFiles(arrayMoveImmutable(files, oldIndex, newIndex));
  };

  const removeFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));
  };

  const convertToPDF = async () => {
    if (!files.length) return;

    try {
      setIsConverting(true);
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        const mimeType = file.type;

        const image =
          mimeType === "image/jpeg" || mimeType === "image/jpg"
            ? await pdfDoc.embedJpg(imageBytes)
            : mimeType === "image/png"
            ? await pdfDoc.embedPng(imageBytes)
            : null;

        if (!image) {
          show("error", "Formato de imagem não suportado", "Use JPG ou PNG");
          continue;
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        const { width, height } = page.getSize();

        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }
      const pdfBytes = await pdfDoc.save();
      downloadPdf(
        pdfBytes,
        files.length > 1 ? "imagens.pdf" : `${files[0].name.split(".")[0]}.pdf`
      );
    } catch (error) {
      show("error", "Erro", "Ocorreu um erro ao converter as imagens");
      console.error("Error converting images to PDF:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const DragHandle = SortableHandle(() => (
    <GripVertical className="cursor-move text-gray-400 hover:text-gray-600" />
  ));
  const SortableItem = SortableElement<{ value: File }>(
    ({ value: file }: { value: File; index: number }) => (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center space-x-2 bg-gray-700 p-3 rounded-lg"
      >
        <DragHandle />
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-16 h-16 object-cover rounded"
        />

        <div className="flex-grow">
          <p className="text-sm font-medium text-gray-200 truncate max-w-[150px]">
            {file.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFile(file)}
          className="text-gray-400 hover:bg-transparent hover:text-red-500"
        >
          <div className="w-full h-full flex items-center justify-center">
            <X className="min-w-4 min-h-4" />
          </div>
        </Button>
      </motion.div>
    )
  );

  const SortableList = SortableContainer<SortableListProps>(
    ({ items }: SortableListProps) => (
      <motion.div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        <AnimatePresence>
          {items.map((file, index) => (
            <SortableItem
              key={`item-${file.name}`}
              index={index}
              value={file}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    )
  );

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
              file={files}
              onChange={handleFileChange}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              fileInputRef={fileInputRef}
              acceptedFileTypes="image/*"
              fileIcon="image"
              multiple
            />
            {files.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-300 mb-2">
                  Ordenar Imagens
                </h2>
                <p className="text-sm text-gray-400 mb-2">
                  Arraste para reordenar as imagens no PDF
                </p>
                <SortableList
                  items={files}
                  onSortEnd={handleSortEnd}
                  useDragHandle
                />
              </div>
            )}
            <Button
              onClick={convertToPDF}
              disabled={!files.length || isConverting}
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
