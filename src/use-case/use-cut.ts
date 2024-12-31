import { cutVideo } from "@/repository/cut-repository";
import { useMutation } from "@tanstack/react-query";

type CutVideoParams = {
  video: File;
  startTime: number;
  endTime: number;
};

export function useCutVideo() {
  return useMutation({
    mutationFn: ({ video, startTime, endTime }: CutVideoParams) =>
      cutVideo(video, startTime, endTime),
  });
}
