import { imageHost } from "@/lib/fileUtils";
import { Category } from "@prisma/client";
import urlJoin from "url-join";
import { categoryImageDir } from "../lib/uploadFolders";

/*  
Data Transfer Object are used to transform data from the database 
to a format that is more suitable for the client
*/

export const categoryDto = (category: any) => {
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
