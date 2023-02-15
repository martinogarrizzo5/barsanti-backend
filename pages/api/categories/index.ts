import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { z } from "zod";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler().get(getCategories).post(createCategory);

async function getCategories(req: NextApiRequest, res: NextApiResponse) {}

const createCategorySchema = z.object({
  name: z.string().min(1),
});
async function createCategory(req: NextApiRequest, res: NextApiResponse) {}
