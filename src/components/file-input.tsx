import { cn } from "@/lib/utils";
import { convertFileSize } from "@/utils/convert-file";
import { Video, Upload } from "lucide-react";

interface FileInputProps {
  file: File | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function FileInput({
  file,
  onChange,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
}: FileInputProps) {
  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "border-4 border-dashed border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-700 hover:bg-opacity-50 transition duration-300",
        isDragging && "border-purple-500 bg-gray-700 bg-opacity-50"
      )}
    >
      {file ? (
        <div className="text-gray-300">
          <Video className="mx-auto h-16 w-16 mb-4" />
          <p className="font-semibold">{file.name}</p>
          <p className="text-sm opacity-70">{convertFileSize(file)}</p>
        </div>
      ) : (
        <div className="text-gray-300">
          <Upload className="mx-auto h-16 w-16 mb-4" />
          <p className="font-semibold">Arraste seu vídeo aqui</p>
          <p className="text-sm opacity-70">ou clique para selecionar</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
