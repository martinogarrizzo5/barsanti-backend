import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import prisma from "@/lib/prisma";
import { addDaysToDate, getTodayDate, getYesterdayDate } from "@/lib/dates";
import { newsDto } from "@/dto/newsDto";

export default apiHandler().get(getHomeData);

// in this version we can have a news both on the latest news and on the highlighted news
async function getHomeData(req: NextApiRequest, res: NextApiResponse) {
  const startDate = addDaysToDate(getTodayDate(), -7);

  const minNewsProps = {
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
  };

  const latestNewsQuery = prisma.news.findMany({
    select: minNewsProps,
    where: {
      date: {
        gte: startDate,
      },
      hidden: false,
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
  });

  const highlitedNewsQuery = prisma.news.findMany({
    select: minNewsProps,
    where: {
      highlighted: true,
      hidden: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [latestNews, highlightedNews] = await prisma.$transaction([
    latestNewsQuery,
    highlitedNewsQuery,
  ]);

  return res.json({
    latestNews: latestNews.map(newsDto),
    highlightedNews: highlightedNews.map(newsDto),
  });
}
