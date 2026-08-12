import type { CompanySettings, Invoice } from "@/lib/db/schema";

function dateFr(value: string | null) {
  return value ? new Intl.DateTimeFormat("fr-MA", { day:"2-digit", month:"2-digit", year:"numeric" }).format(new Date(`${value}T12:00:00`)) : "—";
}

export function CompanyInvoiceHeader({ settings, invoice }: { settings: CompanySettings | Record<string, unknown>; invoice: Invoice }) {
  const s = settings as CompanySettings;
  return <>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 1fr", alignItems:"center", gap:24, marginBottom:24 }}>
      <h1 style={{ margin:0, fontSize:42, lineHeight:1, letterSpacing:"-.055em", textTransform:"uppercase" }}>Facture</h1>
      <div className="invoice-header-logo" role="img" aria-label="Logo OUDAROUR FOOD"/>
      <div style={{ textAlign:"right", fontSize:12, lineHeight:1.8 }}>
        <div><strong>Date :</strong> {dateFr(invoice.invoiceDate)}</div>
        <div><strong>Facture N° :</strong> {invoice.invoiceNumber}</div>
        {invoice.dueDate&&<div><strong>Échéance :</strong> {dateFr(invoice.dueDate)}</div>}
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
        <strong style={{ fontSize:14 }}>{invoice.clientName}</strong>
        <div style={{ fontSize:12, lineHeight:1.55, marginTop:5 }}>{invoice.clientIce&&<div>ICE : {invoice.clientIce}</div>}{invoice.clientIf&&<div>IF : {invoice.clientIf}</div>}{invoice.clientAddress&&<div>{invoice.clientAddress}</div>}{invoice.clientCity&&<div>{invoice.clientCity}</div>}{invoice.clientPhone&&<div>{invoice.clientPhone}</div>}{invoice.clientEmail&&<div>{invoice.clientEmail}</div>}</div>
      </div>
    </div>
  </>;
}
