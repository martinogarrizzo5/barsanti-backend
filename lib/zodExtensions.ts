import { z } from "zod";

export const numericString = z.preprocess(
  (n) => parseInt(z.string().parse(n), 10),
  z.number().int().nonnegative()
);
