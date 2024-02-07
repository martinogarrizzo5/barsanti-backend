import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import prisma from "@/lib/prisma";
import { addDaysToDate, getTodayDate, getYesterdayDate } from "@/lib/dates";
import { compileNewsDto } from "@/dto/newsDto";

export default apiHandler().get(getHomeData);

// in this version we can have a news both on the latest news and on the highlighted news
async function getHomeData(req: NextApiRequest, res: NextApiResponse) {
  const startDate = addDaysToDate(getTodayDate(), -7);

  const latestNewsQuery = prisma.news.findMany({
    select: {
      id: true,
      title: true,
      date: true,
      imageName: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      hidden: true,
    },
    where: {
      date: {
        gte: startDate,
      },
      hidden: false,
      deletedAt: null,
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
  });

  const highlitedNewsQuery = prisma.news.findMany({
    select: {
      id: true,
      title: true,
      date: true,
      imageName: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      hidden: true,
    },
    where: {
      highlighted: true,
      hidden: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [latestNews, highlightedNews] = await Promise.all([
    latestNewsQuery,
    highlitedNewsQuery,
  ]);

  return res.json({
    latestNews: latestNews.map(compileNewsDto),
    highlightedNews: highlightedNews.map(compileNewsDto),
  });
}
