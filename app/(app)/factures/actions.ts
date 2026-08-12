"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createInvoice, duplicateInvoice, updateInvoice, updateInvoiceStatus } from "@/lib/db/queries/invoices";
import { invoiceSchema } from "@/lib/validation/invoice";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/constants";
import { safeMessage } from "@/lib/utils";

type InvoiceResult={success:boolean;message:string;id?:string};
export async function saveInvoiceAction(id:string|null,input:unknown):Promise<InvoiceResult>{
  const session=await auth();if(!session?.user)return{success:false,message:"Votre session a expiré. Reconnectez-vous."};
  const parsed=invoiceSchema.safeParse(input);if(!parsed.success)return{success:false,message:parsed.error.issues[0]?.message||"Vérifiez les informations saisies."};
  try{const invoice=id?await updateInvoice(id,parsed.data):await createInvoice(parsed.data,session.user.id);revalidatePath("/factures");return{success:true,message:id?"Facture modifiée avec succès.":"Facture enregistrée avec succès.",id:invoice.id}}catch(error){return{success:false,message:safeMessage(error,"Une erreur est survenue lors de l’enregistrement.")}}
}
export async function duplicateInvoiceAction(id:string):Promise<InvoiceResult>{const session=await auth();if(!session?.user)return{success:false,message:"Votre session a expiré."};try{const copy=await duplicateInvoice(id,session.user.id);revalidatePath("/factures");return{success:true,message:"Facture dupliquée avec succès.",id:copy.id}}catch(error){return{success:false,message:safeMessage(error)}}
}
export async function changeInvoiceStatusAction(id:string,status:string):Promise<InvoiceResult>{const session=await auth();if(!session?.user)return{success:false,message:"Votre session a expiré."};if(!(status in INVOICE_STATUSES))return{success:false,message:"Statut invalide."};try{await updateInvoiceStatus(id,status as InvoiceStatus);revalidatePath(`/factures/${id}`);revalidatePath("/factures");return{success:true,message:status==="PAID"?"Facture marquée comme payée.":"Statut mis à jour."}}catch(error){return{success:false,message:safeMessage(error)}}
}
