import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth, editorPrivilege } from "@/middlewares/auth";

export default apiHandler()
  .get(getNews)
  .post(auth, editorPrivilege, createNews);

async function getNews(req: NextApiRequest, res: NextApiResponse) {
  const news = await prisma.news.findMany();

  return res.json(news);
}

const createNewsSchema = z.object({});
async function createNews(req: NextApiRequest, res: NextApiResponse) {}
