import { cn } from "@/lib/utils";
import { convertFileSize } from "@/utils/convert-file";
import { Video, Upload, Image } from "lucide-react";

interface FileInputProps {
  file: File | File[] | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  acceptedFileTypes: string;
  fileIcon?: "video" | "image";
  multiple?: boolean;
}

export function FileInput({
  file,
  onChange,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  acceptedFileTypes,
  fileIcon,
  multiple,
}: FileInputProps) {
  const FileIcon = fileIcon === "image" ? Image : Video;
  const renderFiles = () => {
    if (!file) return null;

    if (Array.isArray(file)) {
      return (
        <div className="space-y-2">
          {file.map((f, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-gray-300"
            >
              <span className="truncate max-w-[200px]">{f.name}</span>
              <span className="text-sm opacity-70">{convertFileSize(f)}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-gray-300">
        <FileIcon className="mx-auto h-16 w-16 mb-4" />
        <p className="font-semibold max-w-[300px] truncate">{file.name}</p>
        <p className="text-sm opacity-70">{convertFileSize(file)}</p>
      </div>
    );
  };

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
      {file && Array.isArray(file) && file.length > 0 ? (
        renderFiles()
      ) : (
        <div className="text-gray-300">
          <Upload className="mx-auto h-16 w-16 mb-4" />
          <p className="font-semibold">Arraste seu arquivo aqui</p>
          <p className="text-sm opacity-70">ou clique para selecionar</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={onChange}
        className="hidden"
        multiple={multiple}
      />
    </div>
  );
}
