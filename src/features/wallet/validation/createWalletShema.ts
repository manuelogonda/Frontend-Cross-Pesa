import z from "zod";
import { currencies } from "./transferSchema";

export const createWalletSchema = z.object({
  currency: z.enum(currencies)
});

export type CreateWalletFormData = z.infer<typeof createWalletSchema>;
