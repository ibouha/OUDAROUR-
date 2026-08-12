import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/forms/settings-form";
import { defaultSettings, getCompanySettings } from "@/lib/db/queries/settings";
export const metadata:Metadata={title:"Paramètres"};export const dynamic="force-dynamic";
export default async function SettingsPage(){const settings=await getCompanySettings();return <div className="page" style={{maxWidth:1050}}><PageHeader title="Paramètres" description="Configurez les informations de l’entreprise et de vos factures."/><SettingsForm settings={settings||defaultSettings}/></div>}
