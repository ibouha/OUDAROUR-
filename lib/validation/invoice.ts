import { z } from "zod";

const nullableText = z.string().trim().max(1000).optional().or(z.literal(""));
export const invoiceItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  productReference: z.string().trim().max(80).optional().or(z.literal("")),
  productName: z.string().trim().min(1, "La désignation du produit est obligatoire."),
  description: nullableText,
  quantity: z.coerce.number().positive("La quantité doit être supérieure à 0."),
  unit: z.enum(["PIECE", "KG", "LITER", "CARTON", "JAR", "BOTTLE"]).nullable().optional(),
  unitPriceHt: z.coerce.number().min(0, "Le prix ne peut pas être négatif."),
  discountRate: z.coerce.number().min(0).max(100, "La remise doit être comprise entre 0 et 100."),
  vatRate: z.coerce.number().min(0).max(100, "La TVA doit être comprise entre 0 et 100."),
});
export const invoiceSchema = z.object({
  invoiceDate: z.string().date("La date de facture est invalide."), dueDate: z.union([z.literal(""), z.string().date()]).optional(),
  clientName: z.string().trim().min(1, "Le nom ou la raison sociale est obligatoire."), clientIce: nullableText, clientIf: nullableText,
  clientAddress: nullableText, clientCity: nullableText, clientPhone: nullableText,
  clientEmail: z.union([z.literal(""), z.string().email("L’adresse email est invalide.")]).optional(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CARD", "BILL_OF_EXCHANGE", "OTHER"]).nullable().optional(),
  status: z.enum(["DRAFT", "UNPAID", "PARTIALLY_PAID", "PAID", "CANCELLED"]), notes: nullableText,
  items: z.array(invoiceItemSchema).min(1, "Ajoutez au moins un produit à la facture."),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;
