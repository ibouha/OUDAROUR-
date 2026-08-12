"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateCompanySettings } from "@/lib/db/queries/settings";
import { settingsSchema } from "@/lib/validation/settings";
import { safeMessage } from "@/lib/utils";
export async function saveSettingsAction(input:unknown){const session=await auth();if(!session?.user)return{success:false,message:"Votre session a expiré."};const parsed=settingsSchema.safeParse(input);if(!parsed.success)return{success:false,message:parsed.error.issues[0]?.message||"Vérifiez les informations saisies."};try{await updateCompanySettings(parsed.data);revalidatePath("/parametres");return{success:true,message:"Paramètres enregistrés avec succès."}}catch(error){return{success:false,message:safeMessage(error,"Impossible d’enregistrer les paramètres.")}}}
