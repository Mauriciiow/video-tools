export const sanitizedFileName = (fileName: string, type: "mp4" | "mp3") => {
  return (
    fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.]/g, "_")
      .replace(new RegExp("." + type + "$"), "") +
    (type === "mp4" ? ".mp4" : ".mp3")
  );
};
