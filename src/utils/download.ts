import { ConvertSchemaResponse } from "@/models/convert-schema";
import { sanitizedFileName } from "@/utils/rename";
export const downloadFile = async (file: ConvertSchemaResponse) => {
  const response = await fetch(file.path);
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizedFileName(file.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    return;
  }
};
