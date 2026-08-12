import { z } from "zod";

export const productSchema = z.object({
  reference: z.string().trim().min(1, "La référence est obligatoire.").max(80),
  name: z.string().trim().min(1, "Le nom du produit est obligatoire.").max(180),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  category: z.enum(["HONEY", "JAM", "SYRUP", "OTHER"]),
  unit: z.enum(["PIECE", "KG", "LITER", "CARTON", "JAR", "BOTTLE"]),
  priceHt: z.coerce.number().positive("Le prix doit être supérieur à 0."),
  vatRate: z.coerce.number().min(0, "La TVA doit être comprise entre 0 et 100.").max(100, "La TVA doit être comprise entre 0 et 100."),
  barcode: z.string().trim().max(120).optional().or(z.literal("")),
  imageUrl: z.union([z.literal(""), z.string().url("L’URL de l’image est invalide.")]).optional(),
  isActive: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;
