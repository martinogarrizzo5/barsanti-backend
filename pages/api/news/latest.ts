import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";

export default apiHandler().get(getLatestNews);

async function getLatestNews(req: NextApiRequest, res: NextApiResponse) {
  const news = await prisma.news.findMany({
    orderBy: {
      date: "desc",
    },
    take: 4,
  });

  return res.json(news);
}
