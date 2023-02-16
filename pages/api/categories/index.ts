import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler().get(getCategories).post(createCategory);

async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  const categories = await prisma.category.findMany();

  return res.json(categories);
}

const createCategorySchema = z.object({
  name: z.string().min(1),
});
async function createCategory(req: NextApiRequest, res: NextApiResponse) {}
