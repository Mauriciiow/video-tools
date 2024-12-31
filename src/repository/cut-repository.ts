import { api } from "@/api";

async function cutVideo(video: File, startTime: number, endTime: number) {
  const formData = new FormData();
  formData.append("video", video);
  formData.append("startTime", startTime.toString());
  formData.append("endTime", endTime.toString());

  const response = await api.post("/video/cut", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export { cutVideo };
