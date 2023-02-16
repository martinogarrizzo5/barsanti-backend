import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

export default function handler() {
  return nextConnect<NextApiRequest, NextApiResponse>({
    onError: (err, req, res) => {
      console.error(err);
      res.status(500).json({
        message: "Si è verificato un errore. Per favore riprova più tardi.",
      });
    },
    onNoMatch: (req, res) => {
      res.status(405).json({ message: "Metodo non consentito" });
    },
  });
}
