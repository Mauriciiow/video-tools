import { convertVideoToAudio } from "@/repository/convert-repository";
import { useMutation } from "@tanstack/react-query";

export function useConvertVideoToAudio() {
  return useMutation({
    mutationFn: convertVideoToAudio,
  });
}
