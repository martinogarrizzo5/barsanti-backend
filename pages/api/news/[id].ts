import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { numericString } from "@/lib/zodExtensions";

export default apiHandler().get(getNews).put(editNews).delete(deleteNews);

const getNewsRequestSchema = z.object({
  id: numericString,
});
async function getNews(req: NextApiRequest, res: NextApiResponse) {
  const results = getNewsRequestSchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;
  const news = await prisma.news.findUnique({ where: { id: id } });

  if (news === null) {
    return res.status(404).json({ message: "Notizia non trovata" });
  }

  return res.json(news);
}

async function editNews(req: NextApiRequest, res: NextApiResponse) {}

const deleteNewsRequestSchema = z.object({
  id: numericString,
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
