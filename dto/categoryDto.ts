import { Category } from "@prisma/client";
import urlJoin from "url-join";
import { categoryImageDir } from "../lib/uploadFolders";

/*  
Data Transfer Object are used to transform data from the database 
to a format that is more suitable for the client
*/
export const categoryDto = (category: Category) => {
  const imageHost =
    process.env.NODE_ENV === "production"
      ? process.env.FILES_HOST
      : "http://localhost:3000";

  const imageUrl = urlJoin(
    imageHost!,
    categoryImageDir,
    category.id.toString(),
    category.imageName,
    "?lastUpdate=" + category.updatedAt.getTime()
  );

  return { ...category, imageUrl: imageUrl };
};

export type CategoryDto = ReturnType<typeof categoryDto>;
