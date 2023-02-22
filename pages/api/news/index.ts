import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth, editorPrivilege } from "@/middlewares/auth";

export default apiHandler()
  .get(getNews)
  .post(auth, editorPrivilege, createNews);

const getNewsSchema = z.object({
  page: z.number().optional().default(0),
  search: z.string().optional(),
});
async function getNews(req: NextApiRequest, res: NextApiResponse) {
  const result = getNewsSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const { page, search } = result.data;
  const resultsPerPage = 15;

  const news = await prisma.news.findMany({
    where: {
      title: {
        search: search,
      },
      description: {
        search: search,
      },
    },
    skip: page * resultsPerPage,
    take: resultsPerPage,
  });

  return res.json(news);
}

const createNewsSchema = z.object({});
async function createNews(req: NextApiRequest, res: NextApiResponse) {}
