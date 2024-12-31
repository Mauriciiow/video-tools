import { api } from "@/api";

async function convertVideoToAudio(videoFile: File) {
  const formData = new FormData();
  formData.append("video", videoFile);
  const response = await api.post("/audio/convert", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export { convertVideoToAudio };
