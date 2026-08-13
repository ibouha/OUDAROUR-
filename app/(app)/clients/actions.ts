"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createClient, deleteClient, updateClient } from "@/lib/db/queries/clients";
import { clientSchema } from "@/lib/validation/client";
import { safeMessage } from "@/lib/utils";

export type ClientActionResult = { success: boolean; message: string };

async function authorized() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function saveClientAction(id: string | null, input: unknown): Promise<ClientActionResult> {
  await authorized();
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { success:false, message:parsed.error.issues[0]?.message || "Vérifiez les informations saisies." };
  try {
    if (id) await updateClient(id, parsed.data); else await createClient(parsed.data);
    revalidatePath("/clients");
    revalidatePath("/factures/nouvelle");
    return { success:true, message:id ? "Client modifié avec succès." : "Client ajouté avec succès." };
  } catch (error) {
    return { success:false, message:safeMessage(error, "Cet ICE existe déjà ou les données sont invalides.") };
  }
}

export async function deleteClientAction(id: string): Promise<ClientActionResult> {
  await authorized();
  try {
    const result = await deleteClient(id);
    if (result.used) return { success:false, message:"Ce client est déjà utilisé dans une facture et ne peut pas être supprimé." };
    revalidatePath("/clients");
    return { success:true, message:"Client supprimé." };
  } catch (error) {
    return { success:false, message:safeMessage(error) };
  }
}
