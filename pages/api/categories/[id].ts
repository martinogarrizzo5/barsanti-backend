import apiHandler from "@/lib/apiHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { auth, editorPrivilege } from "@/middlewares/auth";
import { numericString } from "@/lib/zodExtensions";
import prisma from "@/lib/prisma";
import {
  allowOnlyImages,
  MultipartAuthRequest,
  parseMultipart,
} from "@/middlewares/multipart-parser";
import setupUploadDir, { ensureDirExistance } from "@/lib/setupUploadDir";
import { categoryFormatter as formatCategory } from "@/lib/dbFormatters";
import path from "path";
import { categoryUploadPath } from "@/lib/uploadFolders";
import { File } from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler()
  .get(getCategory)
  .put(auth, editorPrivilege, parseMultipart, allowOnlyImages, editCategory)
  .delete(auth, editorPrivilege, deleteCategory);

const getCategorySchema = z.object({
  id: numericString,
});

async function getCategory(req: NextApiRequest, res: NextApiResponse) {
  const results = getCategorySchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;
  const category = await prisma.category.findUnique({ where: { id: id } });

  if (category === null) {
    return res.status(404).json({ message: "Categoria non trovata" });
  }

  return res.json(formatCategory(category));
}

const editCategorySchema = z.object({
  name: z.string().min(1),
});
const editCategoryQuerySchema = z.object({
  id: numericString,
});
async function editCategory(req: MultipartAuthRequest, res: NextApiResponse) {
  const result = editCategorySchema.safeParse(req.body);
  const queryResult = editCategoryQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Nome categoria mancante o invalido" });
  }
  if (!queryResult.success) {
    return res.status(400).json({ message: "Id categoria invalido" });
  }

  const categoryData = result.data;
  const categoryId = queryResult.data.id;

  const existingCategory = await prisma.category.findUnique({
    where: { name: categoryData.name },
  });

  if (existingCategory !== null && existingCategory.id !== categoryId) {
    return res.status(400).json({ message: "Categoria già esistente" });
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: categoryData,
  });

  // save the image if present
  if (req.files && req.files.image instanceof File) {
    const categoryImage = req.files.image as File;

    const imageExtension = path.extname(categoryImage.originalFilename ?? "");
    const oldPath = categoryImage.filepath;
    const uploadDir = await setupUploadDir();
    if (uploadDir === null)
      return res.status(500).json({ message: "Impossibile salvare il file" });

    const imageDir = path.join(
      uploadDir,
      categoryUploadPath,
      categoryId.toString()
    );
    await ensureDirExistance(imageDir);
    const newPath = path.join(imageDir, "image" + imageExtension);

    await fs.rename(oldPath, newPath);
  }

  return res.json({ message: "Categoria modificata con successo" });
}

const deleteCategorySchema = z.object({
  id: numericString,
});
async function deleteCategory(req: NextApiRequest, res: NextApiResponse) {
  const results = deleteCategorySchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;

  try {
    // deleting a category will put as null the categoryId of all the news that had that category
    await prisma.category.delete({ where: { id: id } });
  } catch (err) {
    return res.json({ message: "Categoria inesistente" });
  }

  return res.json({ message: "Categoria eliminata con successo" });
}
