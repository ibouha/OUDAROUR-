import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/db/queries/invoices";
import { defaultSettings, getCompanySettings } from "@/lib/db/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { CompanyInvoiceHeader } from "@/components/invoices/company-invoice-header";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { PRODUCT_UNITS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Détail de la facture" };
export const dynamic = "force-dynamic";

function dateFr(value: string | null) {
  return value ? new Intl.DateTimeFormat("fr-MA", { day:"2-digit", month:"long", year:"numeric" }).format(new Date(`${value}T12:00:00`)) : "—";
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, settingsRow] = await Promise.all([getInvoiceById(id), getCompanySettings()]);
  if (!invoice) notFound();
  const settings = settingsRow || defaultSettings;
  const legalDetails = [settings.capital&&`Capital social : ${settings.capital}`, settings.rc&&`RC n° ${settings.rc}`, settings.taxId&&`IF n° ${settings.taxId}`, settings.ice&&`ICE n° ${settings.ice}`, settings.professionalTax&&`TP n° ${settings.professionalTax}`, settings.cnss&&`CNSS n° ${settings.cnss}`].filter(Boolean).join(" - ");
  return <div className="page">
    <PageHeader title={invoice.invoiceNumber} description={`Émise le ${dateFr(invoice.invoiceDate)} · ${invoice.clientName}`} action={<InvoiceStatusBadge status={invoice.status}/>}/>
    <div style={{ marginBottom:18 }}><InvoiceActions invoice={invoice}/></div>
    <article className="invoice-paper" data-pdf-invoice={invoice.id}>
      <CompanyInvoiceHeader settings={settings} invoice={invoice}/>
      <div style={{ overflow:"hidden" }}><table><thead><tr><th>Désignation</th><th>Quantité</th><th>Prix unitaire HT</th><th>Remise</th><th>TVA</th><th>Total HT</th></tr></thead><tbody>{invoice.items.map((item)=><tr key={item.id}><td><strong>{item.productName}</strong>{item.productReference&&<small style={{ display:"block", color:"#777" }}>{item.productReference}</small>}{item.description&&<small style={{ display:"block", color:"#777" }}>{item.description}</small>}</td><td>{Number(item.quantity).toLocaleString("fr-FR")} {item.unit?PRODUCT_UNITS[item.unit as keyof typeof PRODUCT_UNITS]:""}</td><td>{formatMoney(item.unitPriceHt,settings.currency)}</td><td>{Number(item.discountRate)} %</td><td>{Number(item.vatRate)} %</td><td><strong>{formatMoney(item.lineTotalHt,settings.currency)}</strong></td></tr>)}</tbody></table></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:40, marginTop:28 }}><div style={{ fontSize:12, lineHeight:1.7, color:"#555" }}>{settings.bankDetails&&<p><strong>Informations bancaires :</strong><br/>{settings.bankDetails}</p>}{invoice.notes&&<p><strong>Notes :</strong><br/>{invoice.notes}</p>}</div><InvoiceTotals items={invoice.items.map((item)=>({ quantity:item.quantity, unitPriceHt:item.unitPriceHt, discountRate:item.discountRate, vatRate:item.vatRate }))} currency={settings.currency} document showWords/></div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:48, paddingTop:16, borderTop:"1px solid #ddd", fontSize:11, color:"#666" }}><span>{settings.invoiceFooter||"Merci pour votre confiance."}</span><span style={{ border:"1px solid #ddd", padding:"20px 35px", color:"#999" }}>Signature / Cachet</span></div>
      <footer className="invoice-legal-footer" style={{ margin:"38px -48px -48px", padding:"18px 48px", textAlign:"center", background:"#f3ecda", color:"#30302d", fontSize:10.5, lineHeight:1.65 }}>
        <div><strong>{settings.companyName}</strong>{settings.address&&<> sise à {settings.address}</>} {settings.city&&<>- {settings.city}</>} {settings.country&&<>- {settings.country}</>}</div>
        {legalDetails&&<div>{legalDetails}</div>}
        {(settings.phone||settings.email||settings.website)&&<div>{settings.phone&&<>Tél. {settings.phone}</>}{settings.email&&<> - Email : {settings.email}</>}{settings.website&&<> - {settings.website}</>}</div>}
        <div>Fait à {settings.city||"Maroc"}, le {dateFr(invoice.invoiceDate)}</div>
      </footer>
    </article>
  </div>;
}
