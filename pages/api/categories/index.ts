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
import { categoryImageDir } from "@/lib/uploadFolders";
import { auth, editorPrivilege } from "@/middlewares/auth";
import { getCategoryImageName } from "@/lib/categoriesUtils";
import { move as moveFile } from "fs-extra";
import { categoryDto as formatCategories } from "../../../dto/categoryDto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler()
  .get(getCategories)
  .post(auth, editorPrivilege, parseMultipart, allowOnlyImages, createCategory);

export type GetCategoryResponse = (Category & { _count: { news: number } })[];
async function getCategories(
  req: NextApiRequest,
  res: NextApiResponse<GetCategoryResponse>
) {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          news: { where: { deletedAt: null } },
        },
      },
    },
  });

  res.json(categories.map(category => formatCategories(category)));
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

  const tempImagePath = categoryImage.filepath;
  const newFileName = getCategoryImageName(categoryImage);

  const category = await prisma.category.create({
    data: {
      name: categoryData.name,
      imageName: newFileName,
    },
  });

  try {
    // save the image
    const uploadDir = await setupUploadDir();
    if (uploadDir === null)
      return res.status(500).json({ message: "Impossibile salvare il file" });

    const imageDir = path.join(
      uploadDir,
      categoryImageDir,
      category.id.toString()
    );
    const newPath = path.join(imageDir, category.imageName);

    // check existance of the directory
    await ensureDirExistance(imageDir);
    await moveFile(tempImagePath, newPath, { overwrite: true });

    return res.status(201).json({ message: "Categoria creata con successo" });
  } catch (err) {
    // rollback the category creation
    await prisma.category.delete({
      where: { id: category.id },
    });

    throw err;
  }
}
