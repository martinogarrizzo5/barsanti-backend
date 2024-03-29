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
import { categoryDto as formatCategory } from "@/dto/categoryDto";
import path from "path";
import { categoryImageDir } from "@/lib/uploadFolders";
import { File } from "formidable";
import fs from "fs/promises";
import { getCategoryImageName } from "@/lib/categoriesUtils";
import { move as moveFile } from "fs-extra";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

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
  id: numericString(z.number().int().nonnegative()),
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
  id: numericString(z.number().int().nonnegative()),
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

  // save the image if present
  let newImageName = null;
  if (req.files && req.files.image instanceof File) {
    const categoryImage = req.files.image as File;

    const tempPath = categoryImage.filepath;
    const uploadDir = await setupUploadDir();
    if (uploadDir === null)
      return res.status(500).json({ message: "Impossibile salvare il file" });

    const imageDir = path.join(
      uploadDir,
      categoryImageDir,
      categoryId.toString()
    );
    await ensureDirExistance(imageDir);
    newImageName = getCategoryImageName(categoryImage);
    const newPath = path.join(imageDir, newImageName);

    // delete the old image if the extension is different
    if (newImageName !== existingCategory?.imageName) {
      await fs.rm(path.join(imageDir, existingCategory?.imageName ?? ""));
    }

    await moveFile(tempPath, newPath, { overwrite: true });
  }

  // update image name if it was changed or if it has different extension
  const data: any = { ...categoryData };
  if (newImageName !== null) data.imageName = newImageName;

  await prisma.category.update({
    where: { id: categoryId },
    data: data,
  });

  return res.json({ message: "Categoria modificata con successo" });
}

const deleteCategorySchema = z.object({
  id: numericString(z.number().int().nonnegative()),
});
async function deleteCategory(req: NextApiRequest, res: NextApiResponse) {
  const results = deleteCategorySchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;

  try {
    // deleting a category will put as null the categoryId of all the news that had that category
    await prisma.category.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });

    await prisma.news.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
  } catch (err) {
    console.log(err);
    const error = err as PrismaClientKnownRequestError;
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Categoria inesistente" });
    }

    return res
      .status(500)
      .json({ message: "Impossibile eliminare la categoria" });
  }

  return res.json({ message: "Categoria eliminata con successo" });
}
