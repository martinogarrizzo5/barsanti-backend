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

export function getContentTypeHeader(fileExt: string) {
  switch (fileExt) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
    case ".docx":
      return "application/msword";
    case ".xls":
    case ".xlsx":
      return "application/vnd.ms-excel";
    case ".ppt":
    case ".pptx":
      return "application/vnd.ms-powerpoint";
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".txt":
      return "text/plain";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".ogg":
      return "video/ogg";
    default:
      return "application/octet-stream";
  }
}
