import { NextApiRequest } from "next";

async function checkAuth(req: NextApiRequest) {
  console.log(req.headers);
}
