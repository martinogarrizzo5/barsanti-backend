import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { numericString } from "@/lib/zodExtensions";
import { newsDto as formatNews } from "@/dto/newsDto";
import { MultipartAuthRequest } from "@/middlewares/multipart-parser";

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apiHandler().get(getNews).put(editNews).delete(deleteNews);

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
  category: z.string().min(1).optional(),
  highlighted: z.enum(["true", "false"]).optional(),
});
const ediNewsQuerySchema = z.object({
  id: numericString(z.number().int().nonnegative()),
});
async function editNews(req: MultipartAuthRequest, res: NextApiResponse) {
  const queryResult = ediNewsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = queryResult.data;

  const news = await prisma.news.findUnique({ where: { id: id } });
  if (news === null) {
    return res.status(404).json({ message: "Notizia non trovata" });
  }

  const formResult = editNewsRequestSchema.safeParse(req.body);
  if (!formResult.success) {
    return res.status(400).json({ message: "Dati non validi" });
  }

  const { title, description, category, highlighted } = formResult.data;

  await prisma.news.update({
    where: { id: id },
    data: {
      title: title,
      description: description,
      category: { connect: { name: category } },
      highlighted:
        highlighted === undefined ? undefined : highlighted === "true",
    },
  });

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

  try {
    await prisma.news.delete({ where: { id: id } });
  } catch (err) {
    return res.json({ message: "Notizia inesistente" });
  }

  return res.json({ message: "Notizia eliminata con successo" });
}
