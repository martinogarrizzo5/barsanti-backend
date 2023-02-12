import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({});
}

export default handler;
