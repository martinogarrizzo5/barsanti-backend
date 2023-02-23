import formidable, { Files, Fields, File } from "formidable";
import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { AuthRequest } from "./auth";

export interface MultipartAuthRequest extends AuthRequest {
  files?: Files;
  body: Fields;
}

export async function parseMultipart(
  req: MultipartAuthRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  const contentType = req.headers["content-type"];
  if (contentType && contentType.startsWith("multipart/form-data")) {
    const form = formidable({ multiples: true }); // enable multiple files upload
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(400).json({
          message: "Errore nel parsing dei dati. Verifica l'integrità dei file",
        });
        return;
      }

      req.body = fields;
      req.files = files;
      next();
    });
  }
}

export async function allowOnlyImages(
  req: MultipartAuthRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  if (!req.files) {
    return next();
  }

  for (const file of Object.values(req.files)) {
    const inspectedFile = file as File;

    if (
      inspectedFile.mimetype !== "image/png" &&
      inspectedFile.mimetype !== "image/jpeg"
    ) {
      res.status(400).json({
        message: "Solo immagini in formato png o jpeg sono supportate",
      });
      return;
    }
  }

  next();
}
