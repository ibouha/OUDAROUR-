import { z } from "zod";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));

export const deliveryNoteItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  productReference: z.string().trim().max(80).optional().or(z.literal("")),
  productName: z.string().trim().min(1, "Le produit est obligatoire."),
  description: optionalText,
  boxCount: z.coerce.number().positive("Le nombre de cartons doit être supérieur à 0."),
  piecesPerBox: z.coerce.number().int().positive("Le nombre de pièces par carton doit être supérieur à 0."),
});

export const deliveryNoteSchema = z.object({
  deliveryDate: z.string().date("La date est invalide."),
  clientId: z.string().uuid("Sélectionnez un client."),
  status: z.enum(["PREPARED", "DELIVERED", "CANCELLED"]),
  showPrices: z.boolean().default(false),
  notes: optionalText,
  items: z.array(deliveryNoteItemSchema).min(1, "Ajoutez au moins un produit."),
});

export type DeliveryNoteInput = z.infer<typeof deliveryNoteSchema>;
