export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function convertToSeconds(time: string): number {
  if (!time) return 0;

  const parts = time.split(":").map(Number);

  if (parts.some(isNaN)) return 0;

  const [hours = 0, minutes = 0, seconds = 0] = parts;

  return hours * 3600 + minutes * 60 + seconds;
}
