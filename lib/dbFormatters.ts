import { Category } from "@prisma/client";
import path from "path";
import urlJoin from "url-join";
import { categoryUploadPath } from "./uploadFolders";

export const categoryFormatter = (category: Category) => {
  const imageHost =
    process.env.NODE_ENV === "production"
      ? process.env.API_URL
      : "http://localhost:3000";

  const imageUrl = urlJoin(
    imageHost!,
    "images",
    categoryUploadPath,
    category.id.toString(),
    category.imageName
  );

  return { ...category, imageUrl: imageUrl };
};
