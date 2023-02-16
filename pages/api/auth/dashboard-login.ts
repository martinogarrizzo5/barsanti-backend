import type { NextApiResponse } from "next";
import apiHandler from "@/lib/apiHandler";
import { auth, AuthRequest, editorPrivilege } from "@/middlewares/auth";

export default apiHandler().post(auth, editorPrivilege, verifyIdentity);

async function verifyIdentity(req: AuthRequest, res: NextApiResponse) {
  if (!req.user) {
    return res.status(401).json({ message: "Utente non trovato" });
  }

  res.json({ message: "Credenziali accettate", user: req.user });
}
