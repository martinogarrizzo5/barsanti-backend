import { File as FormFile } from "formidable";
import fs from "fs/promises";
import path from "path";
import setupUploadDir from "./setupUploadDir";
import { newsFilesDir, newsImageDir } from "./uploadFolders";

export async function deleteNewsFiles(newsId: number) {
  const uploadDir = await setupUploadDir();
  if (!uploadDir) throw new Error("Cartella di upload non disponibile");

  const imageDir = path.join(uploadDir, newsImageDir, newsId.toString());
  const filesDir = path.join(uploadDir, newsFilesDir, newsId.toString());

  await Promise.all([
    fs.rm(imageDir, { recursive: true, force: true }),
    fs.rm(filesDir, { recursive: true, force: true }),
  ]);
}

export function getNewsImageName(image: FormFile) {
  if (!image.originalFilename) throw new Error("Nome immagine non trovato");

  const imageExt = path.extname(image.originalFilename);
  const imageFileName = "image" + imageExt;

  return imageFileName;
}

export function getNewsFileName(file: FormFile) {
  if (!file.originalFilename) throw new Error("Nome file non trovato");

  // replace spaces in file name with underscores
  const fileName = file.originalFilename.replace(/ /g, "_");

  return fileName;
}
