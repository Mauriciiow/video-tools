import { auddApi } from "@/api";

export async function getMusicDetails(audioBlob: Blob) {
  const formData = new FormData();
  formData.append("file", audioBlob);
  formData.append("return", "apple_music,spotify");

  const { data } = await auddApi.post("/", formData);

  return data.result;
}
