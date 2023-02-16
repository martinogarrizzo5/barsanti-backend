import apiHandler from "@/lib/apiHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth, editorPrivilege } from "@/middlewares/auth";

export default apiHandler()
  .get(getCategory)
  .put(auth, editorPrivilege, editCategory)
  .delete(auth, editorPrivilege, deleteCategory);

const getCategorySchema = z.object({
  id: z.preprocess(
    (n) => parseInt(z.string().parse(n), 10),
    z.number().int().nonnegative()
  ),
});
async function getCategory(req: NextApiRequest, res: NextApiResponse) {
  const results = getCategorySchema.safeParse(req.query);
  if (!results.success) {
    return res.status(400).json({ message: "Id non valido" });
  }

  const { id } = results.data;
  const category = await prisma.category.findUnique({ where: { id: id } });

  if (category === null) {
    return res.status(404).json({ message: "Categoria non trovata" });
  }

  return res.json(category);
}

async function editCategory(req: NextApiRequest, res: NextApiResponse) {}

async function deleteCategory(req: NextApiRequest, res: NextApiResponse) {}
