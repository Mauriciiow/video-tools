export const downloadFile = (
  file: Blob,
  fileName: string,
  type: "video/mp4" | "audio/mpeg" = "video/mp4"
) => {
  const blob = new Blob([file], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
