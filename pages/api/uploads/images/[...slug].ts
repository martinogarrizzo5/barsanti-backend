import fs from "fs";
import path from "path";
import apiHandler from "@/lib/apiHandler";
import { NextApiRequest, NextApiResponse } from "next";
import setupUploadDir from "@/lib/setupUploadDir";

export default apiHandler().get(serveFile);

async function serveFile(req: NextApiRequest, res: NextApiResponse) {
  const requestedImage = req.query.slug;
  if (!requestedImage || !Array.isArray(requestedImage)) {
    return res.status(404).end();
  }

  const uploadDir = await setupUploadDir();
  if (!uploadDir) {
    return res.status(500).json({ message: "Impossibile accedere al file" });
  }

  const subPath = requestedImage.join("/");
  const imagePath = path.join(uploadDir, subPath);

  const fileStream = fs.createReadStream(imagePath);
  fileStream.pipe(res);
  fileStream.on("error", (err: any) => {
    if (err.code === "ENOENT") {
      return res.status(404).end();
    }
    return res.status(500).end();
  });
}
