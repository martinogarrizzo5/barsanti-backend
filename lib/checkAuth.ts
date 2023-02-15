import admin from "@/firebase/firebaseAdmin";
import { Role } from "@prisma/client";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest } from "next";
import prisma from "./prisma";

// returns true if user token is valid
export async function getRequestUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const [authType, token] = authHeader.split(" ");

  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    if (!decodedValue || new Date(decodedValue.exp * 1000) < new Date()) {
      return null;
    }

    return decodedValue;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function checkUserEditPrivilege(userToken: DecodedIdToken) {
  if (!userToken.email) return null;

  const user = await prisma.user.findUnique({
    where: {
      email: userToken.email,
    },
  });
  if (user?.isEditor || user?.role === Role.ADMIN) return user;

  return null;
}
