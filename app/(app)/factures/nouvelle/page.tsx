import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getActiveProducts } from "@/lib/db/queries/products";
import { defaultSettings, getCompanySettings } from "@/lib/db/queries/settings";
export const metadata:Metadata={title:"Nouvelle facture"};export const dynamic="force-dynamic";
export default async function NewInvoicePage(){const[products,settings]=await Promise.all([getActiveProducts(),getCompanySettings()]);const config=settings||defaultSettings;return <div className="page"><PageHeader title="Nouvelle facture" description="Créez une facture rapidement à partir de votre catalogue."/><InvoiceForm products={products} currency={config.currency} defaultVat={Number(config.defaultVat)}/></div>}
