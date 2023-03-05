import path from "path";

export const imageHost =
  process.env.NODE_ENV === "production"
    ? process.env.FILES_HOST
    : "http://localhost:3000";

export function getImageSrc(image: File | string) {
  if (typeof image === "string") {
    return image;
  }

  return URL.createObjectURL(image);
}

export function getFileShortName(fileName: string) {
  const shortName = fileName.slice(0, 30);
  const ext = path.extname(fileName);

  if (fileName.length > 40) {
    return `${shortName}...${ext}`;
  }

  return fileName;
}
