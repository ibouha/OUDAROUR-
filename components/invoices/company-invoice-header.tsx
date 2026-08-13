import type { ReactNode } from "react";
import type { CompanySettings, Invoice } from "@/lib/db/schema";
import Image from "next/image";
import invoiceLogo from "@/public/logooud1.png";

function dateFr(value: string | null) {
  return value ? new Intl.DateTimeFormat("fr-MA", { day:"2-digit", month:"2-digit", year:"numeric" }).format(new Date(`${value}T12:00:00`)) : "—";
}

type CompanyDocumentHeaderProps = {
  settings: CompanySettings | Record<string, unknown>;
  title: ReactNode;
  documentDate: string;
  documentNumber: string;
  numberLabel: string;
  clientName: string;
  clientIce?: string | null;
  dueDate?: string | null;
};

export function CompanyDocumentHeader({ settings, title, documentDate, documentNumber, numberLabel, clientName, clientIce, dueDate }: CompanyDocumentHeaderProps) {
  const s = settings as CompanySettings;
  return <>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 240px 1fr", alignItems:"center", gap:24, marginBottom:24 }}>
      <h1 style={{ margin:0, fontSize:38, lineHeight:1.05, letterSpacing:"-.055em", textTransform:"uppercase" }}>{title}</h1>
      <Image className="invoice-header-logo" src={invoiceLogo} width={500} height={300} priority unoptimized alt="Logo OUDAROUR FOOD"/>
      <div style={{ textAlign:"right", fontSize:12, lineHeight:1.8 }}>
        <div><strong>Date :</strong> {dateFr(documentDate)}</div>
        <div><strong>{numberLabel} :</strong> {documentNumber}</div>
        {dueDate&&<div><strong>Échéance :</strong> {dateFr(dueDate)}</div>}
      </div>
    </div>

    <div data-invoice-parties style={{ display:"grid", gridTemplateColumns:"1fr minmax(250px, .75fr)", gap:34, borderTop:"1.5px solid #1f1f1d", paddingTop:22, marginBottom:32 }}>
      <div data-invoice-company>
        <strong style={{ display:"block", fontSize:14, marginBottom:10 }}>{s.companyName || "SOCIETE OUDAROUR FOOD SARL"}</strong>
        <div style={{ fontSize:12, color:"#444", lineHeight:1.65 }}>
          {s.address&&<div>{s.address}</div>}
          <div>{[s.city,s.country].filter(Boolean).join(", ")}</div>
          {s.ice&&<div>ICE : {s.ice}</div>}
          {s.taxId&&<div>IF : {s.taxId}</div>}
          {s.professionalTax&&<div>TP : {s.professionalTax}</div>}
          {s.rc&&<div>RC : {s.rc}</div>}
          {s.cnss&&<div>CNSS : {s.cnss}</div>}
          {s.phone&&<div>Tél. : {s.phone}</div>}
          {s.email&&<div>Email : {s.email}</div>}
          {s.website&&<div>{s.website}</div>}
        </div>
      </div>
      <div data-invoice-client style={{ alignSelf:"start", border:"2px solid #222", padding:"17px 20px", textAlign:"center", minHeight:116, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <small style={{ display:"block", color:"#666", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Client</small>
        <strong style={{ fontSize:14 }}>{clientName}</strong>
        {clientIce && <div style={{ fontSize:12, lineHeight:1.55, marginTop:5 }}>ICE : {clientIce}</div>}
      </div>
    </div>
  </>;
}

export function CompanyInvoiceHeader({ settings, invoice }: { settings: CompanySettings | Record<string, unknown>; invoice: Invoice }) {
  return <CompanyDocumentHeader settings={settings} title="Facture" documentDate={invoice.invoiceDate} documentNumber={invoice.invoiceNumber} numberLabel="Facture N°" clientName={invoice.clientName} clientIce={invoice.clientIce} dueDate={invoice.dueDate}/>;
}

export function CompanyDocumentFooter({ settings, documentDate }: { settings: CompanySettings | Record<string, unknown>; documentDate: string }) {
  const s = settings as CompanySettings;
  const legalDetails = [s.capital&&`Capital social : ${s.capital}`, s.rc&&`RC n° ${s.rc}`, s.taxId&&`IF n° ${s.taxId}`, s.ice&&`ICE n° ${s.ice}`, s.professionalTax&&`TP n° ${s.professionalTax}`, s.cnss&&`CNSS n° ${s.cnss}`].filter(Boolean).join(" - ");
  return <footer className="invoice-legal-footer" style={{ margin:"38px -48px -48px", padding:"18px 48px", textAlign:"center", background:"#f3ecda", color:"#30302d", fontSize:10.5, lineHeight:1.65 }}>
    <div><strong>{s.companyName}</strong>{s.address&&<> sise à {s.address}</>} {s.city&&<>- {s.city}</>} {s.country&&<>- {s.country}</>}</div>
    {legalDetails&&<div>{legalDetails}</div>}
    {(s.phone||s.email||s.website)&&<div>{s.phone&&<>Tél. {s.phone}</>}{s.email&&<> - Email : {s.email}</>}{s.website&&<> - {s.website}</>}</div>}
    <div>Fait à {s.city||"Maroc"}, le {dateFr(documentDate)}</div>
  </footer>;
}
