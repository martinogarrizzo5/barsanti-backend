import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Category } from "@prisma/client";
import {
  parseMultipart,
  MultipartAuthRequest,
  allowOnlyImages,
} from "@/middlewares/multipart-parser";
import { File } from "formidable";
import setupUploadDir, { ensureDirExistance } from "@/lib/setupUploadDir";
import fs from "fs/promises";
import path from "path";
import { categoryUploadPath } from "@/lib/uploadFolders";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler()
  .get(getCategories)
  .post(parseMultipart, allowOnlyImages, createCategory);

export type GetCategoryResponse = (Category & { _count: { news: number } })[];
async function getCategories(
  req: NextApiRequest,
  res: NextApiResponse<GetCategoryResponse>
) {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          news: true,
        },
      },
    },
  });

  res.json(categories);
}

const createCategorySchema = z.object({
  name: z.string().min(1),
});

async function createCategory(req: MultipartAuthRequest, res: NextApiResponse) {
  if (!req.files || !(req.files.image instanceof File)) {
    return res.status(400).json({ message: "Immagine categoria mancante" });
  }

  const categoryImage = req.files.image as File;
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Nome categoria invalido" });
  }

  const categoryData = result.data;

  const existingCategory = await prisma.category.findUnique({
    where: { name: categoryData.name },
  });

  if (existingCategory !== null) {
    return res.status(400).json({ message: "Categoria già esistente" });
  }

  const imageExtension = path.extname(categoryImage.originalFilename ?? "");
  const oldPath = categoryImage.filepath;

  const category = await prisma.category.create({
    data: {
      name: categoryData.name,
      imageName: "image" + imageExtension,
    },
  });

  try {
    // save the image
    const uploadDir = await setupUploadDir();
    if (uploadDir === null)
      return res.status(500).json({ message: "Impossibile salvare il file" });

    const imageDir = path.join(
      uploadDir,
      categoryUploadPath,
      category.id.toString()
    );
    const newPath = path.join(imageDir, "image" + imageExtension);

    // check existance of the directory
    await ensureDirExistance(imageDir);
    await fs.rename(oldPath, newPath);

    return res.json({ message: "Categoria creata con successo" });
  } catch (err) {
    // rollback the category creation
    await prisma.category.delete({
      where: { id: category.id },
    });

    throw err;
  }
}
