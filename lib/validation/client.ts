import { z } from "zod";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));

export const clientSchema = z.object({
  type: z.enum(["PARTICULIER", "ENTREPRISE"]),
  name: z.string().trim().min(1, "Le nom est obligatoire.").max(200),
  ice: z.string().trim().max(50).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  address: optionalText,
  mapLocation: z.union([
    z.literal(""),
    z.string().trim().url("La localisation doit être un lien valide."),
  ]).optional(),
}).superRefine((client, context) => {
  if (client.type === "ENTREPRISE" && !client.ice) {
    context.addIssue({ code: "custom", path: ["ice"], message: "L’ICE est obligatoire pour une entreprise." });
  }
});

export type ClientInput = z.infer<typeof clientSchema>;
