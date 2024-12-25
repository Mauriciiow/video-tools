export const convertFileSize = (file: File): string => {
  const sizeInBytes = file.size;
  const units = ["B", "KB", "MB", "GB"];

  if (sizeInBytes === 0) return `0 B`;

  const index = Math.min(
    Math.floor(Math.log2(sizeInBytes) / 10),
    units.length - 1
  );

  const size = sizeInBytes / (1 << (index * 10));
  return `${size.toFixed(2)} ${units[index]}`;
};
