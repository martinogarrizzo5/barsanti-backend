import { File as FormFile } from "formidable";
import path from "path";

export function getCategoryImageName(image: FormFile) {
  if (!image.originalFilename) throw new Error("Nome immagine non trovato");

  const imageExt = path.extname(image.originalFilename);
  const imageFileName = "image" + imageExt;

  return imageFileName;
}
