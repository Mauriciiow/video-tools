import { convertVideoToAudio } from "@/repository/convert-repository";
import { useMutation } from "@tanstack/react-query";
import { ConvertSchemaResponse } from "@/models/convert-schema";
export function useConvertVideoToAudio() {
  return useMutation<ConvertSchemaResponse, Error, File>({
    mutationFn: convertVideoToAudio,
  });
}
