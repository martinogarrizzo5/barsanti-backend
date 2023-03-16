import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

export default function handler() {
  const apiHandler = nextConnect<NextApiRequest, NextApiResponse>({
    onError: (err, req, res) => {
      console.error(err);
      res.status(500).json({
        message: err.stack,
      });
    },
    onNoMatch: (req, res) => {
      res.status(405).json({ message: "Metodo non consentito" });
    },
  });

  return apiHandler;
}
