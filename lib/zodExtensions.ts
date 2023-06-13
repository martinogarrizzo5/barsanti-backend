import { z } from "zod";

export const numericString = (schema: z.ZodTypeAny) =>
  z.preprocess(n => {
    if (typeof n === "string") {
      return parseInt(n, 10);
    } else if (typeof n === "number") {
      return n;
    } else {
      return undefined;
    }
  }, schema) as z.ZodEffects<z.ZodTypeAny, number, number>;

export const booleanString = (schema: z.ZodTypeAny) =>
  z.preprocess(val => {
    if (val === "true") return true;

    return false;
  }, schema) as z.ZodEffects<z.ZodTypeAny, boolean, boolean>;
