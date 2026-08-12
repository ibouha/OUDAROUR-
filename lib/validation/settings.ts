import { z } from "zod";

const text = z.string().trim().max(2000).optional().or(z.literal(""));
export const settingsSchema = z.object({
  companyName: z.string().trim().min(1, "La raison sociale est obligatoire."), tradeName: text,
  logoUrl: z.union([z.literal(""), z.string().url("L’URL du logo est invalide.")]).optional(),
  address: text, city: text, country: z.string().trim().min(1, "Le pays est obligatoire."), capital: text, ice: text, taxId: text, professionalTax: text, rc: text, cnss: text, phone: text,
  email: z.union([z.literal(""), z.string().email("L’adresse email est invalide.")]).optional(),
  website: z.union([z.literal(""), z.string().url("L’URL du site est invalide.")]).optional(), bankDetails: text,
  invoicePrefix: z.string().trim().min(1, "Le préfixe est obligatoire.").max(12).regex(/^[A-Z0-9-]+$/, "Utilisez uniquement des majuscules, chiffres et tirets."),
  defaultVat: z.coerce.number().min(0).max(100), currency: z.string().trim().min(1).max(6), paymentTerms: text, invoiceFooter: text,
});
export type SettingsInput = z.infer<typeof settingsSchema>;
