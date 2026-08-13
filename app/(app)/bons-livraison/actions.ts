"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createDeliveryNote, deleteDeliveryNote } from "@/lib/db/queries/delivery-notes";
import { deliveryNoteSchema } from "@/lib/validation/delivery-note";
import { safeMessage } from "@/lib/utils";

export async function saveDeliveryNoteAction(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success:false, message:"Votre session a expiré." };
  const parsed = deliveryNoteSchema.safeParse(input);
  if (!parsed.success) return { success:false, message:parsed.error.issues[0]?.message || "Vérifiez les informations." };
  try {
    const note = await createDeliveryNote(parsed.data, session.user.id);
    revalidatePath("/bons-livraison");
    return { success:true, message:"Bon de livraison enregistré.", id:note.id };
  } catch (error) {
    return { success:false, message:safeMessage(error, "Impossible d’enregistrer le bon de livraison.") };
  }
}

export async function deleteDeliveryNoteAction(id: string) {
  const session = await auth();
  if (!session?.user) return { success:false, message:"Votre session a expiré." };
  try {
    await deleteDeliveryNote(id);
    revalidatePath("/bons-livraison");
    return { success:true, message:"Bon de livraison supprimé." };
  } catch (error) {
    return { success:false, message:safeMessage(error, "Impossible de supprimer le bon de livraison.") };
  }
}
