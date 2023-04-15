import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth, editorPrivilege } from "@/middlewares/auth";
import {
  MultipartAuthRequest,
  parseMultipart,
} from "@/middlewares/multipart-parser";
import { numericString } from "@/lib/zodExtensions";
import path from "path";
import { File as FormFile } from "formidable";
import setupUploadDir, { ensureDirExistance } from "@/lib/setupUploadDir";
import { newsImageDir, newsFilesDir } from "@/lib/uploadFolders";
import fs from "fs/promises";
import { fromZodError } from "zod-validation-error";
import { newsDto as formatNews } from "@/dto/newsDto";
import {
  deleteNewsFiles,
  getNewsFileName,
  getNewsImageName,
} from "@/lib/newsUtils";
import { move as moveFile } from "fs-extra";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler()
  .get(getNews)
  .post(auth, editorPrivilege, parseMultipart, createNews);

const getNewsSchema = z.object({
  // cursor: numericString(z.number().optional()), // date of news (used for infine scroll in future)
  page: numericString(z.number().optional().default(0)),
  take: numericString(z.number()).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: numericString(z.number().int().nonnegative()).optional(),
  highlighted: z.enum(["true", "false"]).optional(),
  ids: z.string().optional(), // string of ids separated by comma
});
async function getNews(req: NextApiRequest, res: NextApiResponse) {
  const result = getNewsSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: fromZodError(result.error).message });
  }

  const { page, search, startDate, endDate, category, highlighted, ids, take } =
    result.data;
  const resultsPerPage = take ?? 15;

  // reconstruct ids array: 1,3,5 => [1,3,5]
  let newsIds;
  if (ids) {
    newsIds = ids
      .split(",")
      .filter(id => !isNaN(parseInt(id)))
      .map(id => parseInt(id));
  }

  const news = await prisma.news.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      id: {
        in: newsIds,
      },
      title: {
        search: search,
      },
      description: {
        search: search,
      },
      categoryId: category,
      date: {
        gte: startDate,
        lte: endDate,
      },
      highlighted: highlighted === "true" ? true : undefined,
    },
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
          updatedAt: true,
        },
      },
    },
    skip: page * resultsPerPage,
    take: resultsPerPage,
  });

  return res.json(news.map(formatNews));
}

const createNewsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: numericString(z.number().int().nonnegative()),
  highlighted: z.enum(["true", "false"]),
  date: z.string(), // as date
});
async function createNews(req: MultipartAuthRequest, res: NextApiResponse) {
  // data validation
  const result = createNewsSchema.safeParse(req.body);
  const rawImage = req.files?.image;
  const rawFiles = req.files?.newFiles;
  if (!rawImage) return res.status(400).json({ message: "Immagine mancante" });
  if (!result.success) {
    return res
      .status(400)
      .json({ message: fromZodError(result.error).message });
  }
  const image = rawImage as FormFile;
  if (!image.mimetype?.startsWith("image/"))
    return res.status(400).json({ message: "Immagine non valida" });
  if (!image.originalFilename)
    return res.status(400).json({ message: "Nome immagine mancante" });

  const { title, description, category, highlighted, date } = result.data;
  const formattedDate = new Date(date);

  // get image base info
  const tempImagePath = image.filepath;
  const imageFileName = getNewsImageName(image);

  // get files base info
  let files = rawFiles;
  if (!files) files = [];
  if (!Array.isArray(files)) {
    files = [files];
  }
  const tempFilesPath = files.map(file => file.filepath);
  const filesNames = files.map(file => getNewsFileName(file));

  const news = await prisma.news.create({
    data: {
      title,
      description,
      category: {
        connect: {
          id: category,
        },
      },
      highlighted: highlighted === "true",
      date: formattedDate,
      author: {
        connect: {
          id: req.user!.id,
        },
      },
      imageName: imageFileName,
      files: {
        create: filesNames.map(fileName => ({
          name: fileName,
          user: {
            connect: {
              id: req.user!.id,
            },
          },
        })),
      },
    },
  });

  try {
    const uploadDir = await setupUploadDir();
    if (uploadDir === null) {
      return res.status(500).json({ message: "Impossibile salvare il file" });
    }

    const imageDir = path.join(uploadDir, newsImageDir, news.id.toString());
    const filesDir = path.join(uploadDir, newsFilesDir, news.id.toString());

    // handle files save
    await ensureDirExistance(filesDir);
    await Promise.all(
      filesNames.map((fileName, i) => {
        const filePath = path.join(filesDir, fileName);
        return moveFile(tempFilesPath[i], filePath, { overwrite: true });
      })
    );

    // save image
    await ensureDirExistance(imageDir);
    const imagePath = path.join(imageDir, imageFileName);
    await moveFile(tempImagePath, imagePath, { overwrite: true });

    return res.status(201).json({ message: "Notizia creata con successo" });
  } catch {
    // TODO: delete files uploaded
    await deleteNewsFiles(news.id);

    // delete news if image or files upload fails
    await prisma.news.delete({
      where: {
        id: news.id,
      },
    });
    return res.status(500).json({ message: "Impossibile salvare il file" });
  }

  // return res.status(201).json({ message: "Notizia creata con successo" });
}
