import fs from "fs";
import path from "path";
import apiHandler from "@/lib/apiHandler";
import { NextApiRequest, NextApiResponse } from "next";
import setupUploadDir from "@/lib/setupUploadDir";
import { getContentTypeHeader } from "@/lib/fileUtils";

export default apiHandler().get(serveFile);

// TODO: support authentication for private files
async function serveFile(req: NextApiRequest, res: NextApiResponse) {
  const requestedImage = req.query.slug;
  if (!requestedImage || !Array.isArray(requestedImage)) {
    return res.status(404).end();
  }

  const uploadDir = await setupUploadDir();
  if (!uploadDir) {
    return res.status(500).json({ message: "Impossibile accedere al file" });
  }

  // prevent path traversal attack
  const subPath = requestedImage.join("/");
  var safePath = path.normalize(subPath).replace(/^(\.\.(\/|\\|$))+/, "");
  if (safePath.indexOf("\0") !== -1) {
    return res.status(400).end();
  }

  const filePath = path.join(uploadDir, "files", safePath);
  const fileStream = fs.createReadStream(filePath);
  const fileExt = path.extname(filePath);

  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Content-Type", getContentTypeHeader(fileExt));

  fileStream.pipe(res);

  fileStream.on("error", (err: any) => {
    if (err.code === "ENOENT") {
      return res.status(404).end();
    }
    return res.status(500).end();
  });
}
