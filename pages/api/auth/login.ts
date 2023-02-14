import type { NextApiRequest, NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import admin from "@/firebase/firebaseAdmin";
import { checkUserEditPrivilege } from "@/lib/checkAuth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export default apiHandler({
  POST: verifyIdentity,
});

async function verifyIdentity(req: NextApiRequest, res: NextApiResponse) {
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

  const user = await checkUserEditPrivilege(firebaseToken);
  if (!user) {
    return res
      .status(403)
      .json({ message: "Credenziali insufficenti per accedere" });
  }

  res.json({ message: "Credenziali accettate", user: user });
}
