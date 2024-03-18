import { imageHost } from "@/lib/fileUtils";
import { newsFilesDir, newsImageDir } from "@/lib/uploadFolders";
import { Category, News, File as PrismaFile } from "@prisma/client";
import urlJoin from "url-join";
import { exclude } from "./modelUtils";

// minimum fields required for a news
export interface MinNews {
  id: number;
  title: string;
  imageName: string;
  createdAt: Date;
  updatedAt: Date;
  hidden: boolean;
  highlighted?: boolean;
  date: Date;
  description?: string;
  category?: {
    id: number;
    name: string;
  } | null;
  [key: string]: any;
}

export interface DtoFile extends PrismaFile {
  url: string;
}

export const compileNewsDto = (news: MinNews) => {
  const imageUrl = urlJoin(
    imageHost!,
    newsImageDir,
    news.id.toString(),
    news.imageName,
    "?lastUpdate=" + news.updatedAt.getTime()
  );

  let files: DtoFile[] | null = null;
  if (news.files) {
    files = news.files.map((file: PrismaFile) => {
      return {
        ...file,
        url: urlJoin(
          imageHost!,
          newsFilesDir,
          news.id.toString(),
          file.name,
          "?lastUpdate=" + file.updatedAt.getTime()
        ),
      };
    });
  }

  return { ...news, imageUrl: imageUrl, ...(files && { files }) };
};

export type NewsDto = ReturnType<typeof compileNewsDto>;
