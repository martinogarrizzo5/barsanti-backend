import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";

export default apiHandler().get(getNews).post(createNews);

async function getNews(req: NextApiRequest, res: NextApiResponse) {}

const createNewsSchema = z.object({});
async function createNews(req: NextApiRequest, res: NextApiResponse) {}
