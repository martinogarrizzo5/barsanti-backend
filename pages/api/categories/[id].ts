import apiHandler from "@/lib/apiHandler";
import { NextApiRequest, NextApiResponse } from "next";

export default apiHandler().get(getCategory);

async function getCategory(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
}
