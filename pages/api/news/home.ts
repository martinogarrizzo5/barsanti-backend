import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import prisma from "@/lib/prisma";

export default apiHandler().get(getHomeData);

// in this version we can have a news both on the latest news and on the highlighted news
async function getHomeData(req: NextApiRequest, res: NextApiResponse) {
  const latestNewsQuery = prisma.news.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const highlitedNewsQuery = prisma.news.findMany({
    where: {
      highlighted: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [latestNews, highlightedNews] = await prisma.$transaction([
    latestNewsQuery,
    highlitedNewsQuery,
  ]);

  return res.json({ latestNews, highlightedNews });
}
