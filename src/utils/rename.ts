export const sanitizedFileName = (fileName: string) => {
  return fileName.replace(/\s/g, "_");
};
