import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

export async function middleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) {}
