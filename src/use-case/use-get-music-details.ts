import { getMusicDetails } from "@/repository/audd-repository";
import { useMutation } from "@tanstack/react-query";
import { MusicResponse } from "@/models/music-schema";

export function useGetMusicDetails() {
  return useMutation<MusicResponse, Error, Blob>({
    mutationFn: (audioBlob: Blob) => getMusicDetails(audioBlob),
  });
}
