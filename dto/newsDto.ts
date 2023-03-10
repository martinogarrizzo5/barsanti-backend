import { imageHost } from "@/lib/fileUtils";
import { newsFilesDir, newsImageDir } from "@/lib/uploadFolders";
import { News } from "@prisma/client";
import urlJoin from "url-join";
import { exclude } from "./modelUtils";

// minimum fields required for a news
export interface MinimumNews {
  id: number;
  title: string;
  imageName: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}
export const newsDto = (news: MinimumNews) => {
  const imageUrl = urlJoin(
    imageHost!,
    newsImageDir,
    news.id.toString(),
    news.imageName,
    "?lastUpdate=" + news.updatedAt.getTime()
  );

  let files = null;
  if (news.files) {
    files = news.files.map((file: any) => {
      return {
        ...file,
        url: urlJoin(
          imageHost!,
          newsFilesDir,
          news.id.toString(),
          file.name,
          "?lastUpdate=" + news.updatedAt.getTime()
        ),
      };
    });
  }

  // exlude unnecessary fields or overwritten fields
  exclude(news, ["imageName", "authorId", "categoryId", "files"]);

  return { ...news, imageUrl: imageUrl, ...(files && { files }) };
};

export type NewsDto = ReturnType<typeof newsDto>;