import admin from "@/firebase/firebaseAdmin";
import { checkUserEditPrivilege } from "@/lib/checkAuth";
import { Role, User } from "@prisma/client";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

export interface AuthRequest extends NextApiRequest {
  user?: User | null;
}

export async function auth(
  req: AuthRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token di autenticazione richiesto" });
  }
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token di autenticazione invalido" });
  }

  const [authType, token] = authHeader.split(" ");
  let firebaseToken: DecodedIdToken | null = null;

  // verify token with firebase admin sdk
  try {
    firebaseToken = await admin.auth().verifyIdToken(token);
    if (!firebaseToken || new Date(firebaseToken.exp * 1000) < new Date()) {
      res.status(401).json({ message: "Token di autenticazione invalido" });
      return;
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token di autenticazione invalido" });
  }

  // match only @barsanti.edu.it emails
  const userEmail = firebaseToken.email;
  const emailPattern = /^[\w-\.]+@barsanti\.edu\.it$/i;
  if (!userEmail || !emailPattern.test(userEmail)) {
    return res.status(401).json({ message: "Email mancante o non valida" });
  }

  // find related user in db
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  // attach user to following middlewares
  req.user = user;

  next();
}

export async function editorPrivilege(
  req: AuthRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Necessario accedere con un account valido" });
  }

  if (req.user?.isEditor || req.user?.role === Role.ADMIN) {
    return next();
  }

  return res
    .status(403)
    .json({ message: "Necessario essere editori per modificare dati" });
}
