import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeliveryNoteById } from "@/lib/db/queries/delivery-notes";
import { defaultSettings, getCompanySettings } from "@/lib/db/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { DeliveryNoteActions } from "@/components/delivery-notes/delivery-note-actions";
import { CompanyDocumentFooter, CompanyDocumentHeader } from "@/components/invoices/company-invoice-header";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title:"Bon de livraison" };
export const dynamic = "force-dynamic";

function dateFr(value: string) {
  return new Intl.DateTimeFormat("fr-MA", { day:"2-digit", month:"long", year:"numeric" }).format(new Date(`${value}T12:00:00`));
}

export default async function DeliveryNotePage({ params }: { params:Promise<{ id:string }> }) {
  const { id } = await params;
  const [note, settingsRow] = await Promise.all([getDeliveryNoteById(id), getCompanySettings()]);
  if (!note) notFound();
  const settings = settingsRow || defaultSettings;

  return <div className="page">
    <PageHeader title={note.deliveryNumber} description={`Bon de livraison du ${dateFr(note.deliveryDate)} · ${note.clientName}`}/>
    <div style={{ marginBottom:18 }}><DeliveryNoteActions noteId={note.id} deliveryNumber={note.deliveryNumber}/></div>
    <article className="invoice-paper" data-pdf-delivery-note={note.id}>
      <CompanyDocumentHeader settings={settings} title={<>Bon de<br/>livraison</>} documentDate={note.deliveryDate} documentNumber={note.deliveryNumber} numberLabel="Bon N°" clientName={note.clientName} clientIce={note.clientIce}/>
      <div style={{ overflow:"hidden" }}><table><thead><tr><th>Désignation</th><th>Cartons</th><th>Pièces/carton</th><th>Total pièces</th>{note.showPrices && <><th>Prix/pièce HT</th><th>TVA</th><th>Total HT</th></>}</tr></thead><tbody>{note.items.map((item) => <tr key={item.id}><td><strong>{item.productName}</strong>{item.productReference && <small style={{ display:"block", color:"#777" }}>{item.productReference}</small>}{item.description && <small style={{ display:"block", color:"#777" }}>{item.description}</small>}</td><td>{Number(item.boxCount).toLocaleString("fr-FR")}</td><td>{item.piecesPerBox}</td><td><strong>{Number(item.totalPieces).toLocaleString("fr-FR")}</strong></td>{note.showPrices && <><td>{formatMoney(item.unitPriceHt, settings.currency)}</td><td>{Number(item.vatRate)} %</td><td><strong>{formatMoney(item.lineTotalHt, settings.currency)}</strong></td></>}</tr>)}</tbody></table></div>
      <div style={{ display:"grid", gridTemplateColumns:note.showPrices ? "1fr 330px" : "1fr", gap:40, marginTop:28 }}>
        <div style={{ fontSize:12, lineHeight:1.7, color:"#555" }}>{note.notes&&<p><strong>Notes :</strong><br/>{note.notes}</p>}</div>
        {note.showPrices && <InvoiceTotals items={note.items.map((item) => ({ quantity:item.totalPieces, unitPriceHt:item.unitPriceHt, vatRate:item.vatRate }))} currency={settings.currency} document showWords/>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, marginTop:70 }}><div style={{ borderTop:"1px solid #aaa", paddingTop:8, textAlign:"center" }}>Signature OUDAROUR FOOD</div><div style={{ borderTop:"1px solid #aaa", paddingTop:8, textAlign:"center" }}>Signature du client</div></div>
      <CompanyDocumentFooter settings={settings} documentDate={note.deliveryDate}/>
    </article>
  </div>;
}
