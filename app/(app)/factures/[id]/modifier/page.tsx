import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getInvoiceById } from "@/lib/db/queries/invoices";
import { getActiveProducts } from "@/lib/db/queries/products";
import { getClients } from "@/lib/db/queries/clients";
import { defaultSettings, getCompanySettings } from "@/lib/db/queries/settings";
export const metadata:Metadata={title:"Modifier la facture"};export const dynamic="force-dynamic";
export default async function EditInvoicePage({params}:{params:Promise<{id:string}>}){const{id}=await params;const[invoice,products,clients,settings]=await Promise.all([getInvoiceById(id),getActiveProducts(),getClients(),getCompanySettings()]);if(!invoice)notFound();if(!["DRAFT","UNPAID"].includes(invoice.status))redirect(`/factures/${id}`);const config=settings||defaultSettings;return <div className="page"><PageHeader title={`Modifier ${invoice.invoiceNumber}`} description="Les changements n’affectent pas votre catalogue de produits."/><InvoiceForm invoice={invoice} products={products} clients={clients} currency={config.currency} defaultVat={Number(config.defaultVat)}/></div>}
