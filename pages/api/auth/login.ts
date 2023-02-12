import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import apiHandler from "@/lib/apiHandler";
import admin from "@/firebase/firebaseAdmin";

export default apiHandler({
  POST: verifyIdentity,
});

async function verifyIdentity(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const [authType, token] = authHeader.split(" ");

  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    if (!decodedValue || new Date(decodedValue.exp * 1000) < new Date()) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    console.log(decodedValue);
    res.json({});
  } catch (err) {}
}
