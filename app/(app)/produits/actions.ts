"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createProduct, deactivateProduct, deleteProduct, updateProduct } from "@/lib/db/queries/products";
import { productSchema } from "@/lib/validation/product";
import { safeMessage } from "@/lib/utils";

async function authorized() { const session = await auth(); if (!session?.user) throw new Error("Non autorisé"); }
export type ActionResult = { success: boolean; message: string };

export async function saveProductAction(id: string | null, input: unknown): Promise<ActionResult> {
  await authorized(); const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success:false, message:parsed.error.issues[0]?.message || "Vérifiez les informations saisies." };
  try { if (id) await updateProduct(id, parsed.data); else await createProduct(parsed.data); revalidatePath("/produits"); return { success:true, message:id ? "Produit modifié avec succès." : "Produit ajouté avec succès." }; }
  catch (error) { return { success:false, message:safeMessage(error, "Cette référence existe déjà ou les données sont invalides.") }; }
}
export async function toggleProductAction(id: string, isActive: boolean): Promise<ActionResult> {
  await authorized(); try { await deactivateProduct(id,isActive); revalidatePath("/produits"); return { success:true, message:isActive ? "Produit activé." : "Produit désactivé." }; } catch(error) { return { success:false, message:safeMessage(error) }; }
}
export async function deleteProductAction(id: string): Promise<ActionResult> {
  await authorized(); try { const result=await deleteProduct(id); if(result.used) return { success:false, message:"Ce produit est déjà utilisé dans une ou plusieurs factures. Vous pouvez le désactiver." }; revalidatePath("/produits"); return { success:true,message:"Produit supprimé." }; } catch(error) { return { success:false,message:safeMessage(error) }; }
}
