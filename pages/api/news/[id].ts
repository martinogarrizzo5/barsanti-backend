import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { numericString } from "@/lib/zodExtensions";
import { newsDto as formatNews } from "@/dto/newsDto";
import {
  MultipartAuthRequest,
  parseMultipart,
} from "@/middlewares/multipart-parser";
import setupUploadDir, { ensureDirExistance } from "@/lib/setupUploadDir";
import path from "path";
import { newsFilesDir, newsImageDir } from "@/lib/uploadFolders";
import fs from "fs/promises";
import {
  deleteNewsFiles,
  getNewsFileName,
  getNewsImageName,
} from "@/lib/newsUtils";
import { File as FormFile } from "formidable";
import { auth, editorPrivilege } from "@/middlewares/auth";
import { fromZodError } from "zod-validation-error";

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apiHandler()
  .get(getNews)
  .put(auth, editorPrivilege, parseMultipart, editNews)
  .delete(auth, editorPrivilege, deleteNews);

const getNewsRequestSchema = z.object({
  id: numericString(z.number().int().nonnegative()),
});
async function getNews(req: NextApiRequest, res: NextApiResponse) {
  const results = getNewsRequestSchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;
  const news = await prisma.news.findUnique({
    where: { id: id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      files: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (news === null) {
    return res.status(404).json({ message: "Notizia non trovata" });
  }

  return res.json(formatNews(news));
}

const editNewsRequestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: numericString(z.number().int().nonnegative()).optional(),
  highlighted: z.enum(["true", "false"]).optional(),
  date: z.string().optional(), // as datetime
  deletedFiles: z
    .array(numericString(z.number().int().nonnegative()))
    .optional(),
});
const ediNewsQuerySchema = z.object({
  id: numericString(z.number().int().nonnegative()),
});
async function editNews(req: MultipartAuthRequest, res: NextApiResponse) {
  // parse query params
  const queryResult = ediNewsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = queryResult.data;

  // check news existance and get it
  const oldNews = await prisma.news.findUnique({
    where: { id: id },
    include: { files: true },
  });
  if (oldNews === null) {
    return res.status(404).json({ message: "Notizia non trovata" });
  }

  // parse form data
  const formResult = editNewsRequestSchema.safeParse(req.body);
  if (!formResult.success) {
    return res
      .status(400)
      .json({ message: fromZodError(formResult.error).message });
  }

  const { title, description, category, highlighted, date, deletedFiles } =
    formResult.data;

  console.log(formResult.data);

  let newImageName;
  if (req.files?.image && !Array.isArray(req.files.image)) {
    newImageName = getNewsImageName(req.files?.image);
  }

  // update news data
  try {
    await prisma.news.update({
      where: { id: id },
      data: {
        title: title,
        description: description,
        categoryId: category,
        imageName: newImageName,
        highlighted:
          highlighted === undefined ? undefined : highlighted === "true",
        date: date ? new Date(date) : undefined,
        files: {
          deleteMany: {
            id: {
              in: deletedFiles ?? [],
            },
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Impossibile modificare la news" });
  }

  // upload new files
  if (req.files) {
    const uploadDir = await setupUploadDir();
    if (uploadDir === null)
      return res
        .status(500)
        .json({ message: "Impossibile trovare la cartella di upload" });

    let rawImage = req.files.image;
    let image: FormFile | null;
    if (!rawImage || Array.isArray(rawImage)) {
      image = null;
    } else {
      image = rawImage;
    }

    let newFiles = req.files.newFiles;
    if (!newFiles) newFiles = [];
    if (!Array.isArray(newFiles)) {
      newFiles = [newFiles];
    }

    const filesDir = path.join(uploadDir, newsFilesDir, oldNews.id.toString());
    const imageDir = path.join(uploadDir, newsImageDir, oldNews.id.toString());

    try {
      await ensureDirExistance(filesDir);
      await ensureDirExistance(imageDir);

      // substitute image
      if (image) {
        const tempImagePath = image.filepath;
        const newImageName = getNewsImageName(image);
        const newImagePath = path.join(imageDir, newImageName);
        try {
          if (newImageName !== oldNews.imageName) {
            await fs.rm(path.join(imageDir, oldNews.imageName ?? ""));
          }

          await fs.rename(tempImagePath, newImagePath);
        } catch (err: any) {
          if (err.code === "ENOENT") {
            await fs.copyFile(tempImagePath, newImagePath);
            await fs.rm(tempImagePath);
          }
        }
      }

      // delete old files
      if (deletedFiles && oldNews.files.length > 0) {
        for (const fileId of deletedFiles) {
          const oldFile = oldNews.files.find(f => f.id === fileId);
          if (oldFile) {
            fs.rm(path.join(filesDir, oldFile.name));
          }
        }
      }

      let newFilesName = newFiles.map(file => getNewsFileName(file));

      // create new files references
      await prisma.file.createMany({
        data: newFiles.map((file, i) => {
          return {
            name: newFilesName[i],
            newsId: oldNews.id,
            userId: req.user!.id,
          };
        }),
      });

      // move new files to the right directory
      await Promise.all(
        newFiles.map((file, i) => {
          const tempFilePath = file.filepath;
          const newFilePath = path.join(filesDir, newFilesName[i]);
          return fs.rename(tempFilePath, newFilePath);
        })
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Impossibile caricare i files" });
    }
  }

  return res.json({ message: "Notizia modificata con successo" });
}

const deleteNewsRequestSchema = z.object({
  id: numericString(z.number().int().nonnegative()),
});
async function deleteNews(req: NextApiRequest, res: NextApiResponse) {
  const results = deleteNewsRequestSchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;

  const deleteNewsQuery = prisma.news.delete({ where: { id: id } });
  const deleteFilesQuery = prisma.file.deleteMany({
    where: { newsId: id },
  });

  let news;
  try {
    const [filesCount, newsData] = await prisma.$transaction([
      deleteFilesQuery,
      deleteNewsQuery,
    ]);
    news = newsData;
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Notizia inesistente" });
  }

  try {
    // delete files and images from disk
    await deleteNewsFiles(news.id);
  } catch (err) {
    console.log(err);

    // rollback news deletion
    await prisma.news.create({ data: news });

    // TODO: rollback files deletion

    return res
      .status(500)
      .json({ message: "Impossibile eliminare i file della news" });
  }

  return res.json({ message: "Notizia eliminata con successo" });
}
