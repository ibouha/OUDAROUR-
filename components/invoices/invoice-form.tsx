"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { Eye, FileCheck2, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { Client, Invoice, InvoiceItem, Product } from "@/lib/db/schema";
import { INVOICE_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import { invoiceSchema, type InvoiceInput } from "@/lib/validation/invoice";
import { calculateLine, formatMoney } from "@/lib/money";
import { saveInvoiceAction } from "@/app/(app)/factures/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { ProductSelector } from "./product-selector";
import { InvoiceTotals } from "./invoice-totals";

type EditableInvoice = Invoice & { items: InvoiceItem[] };
const blankItem = { productId:null, productReference:"", productName:"", description:"", boxCount:1, piecesPerBox:1, unit:"PIECE" as const, unitPriceHt:0, vatRate:20 };
const pricedItem = (item: InvoiceInput["items"][number]) => ({ ...item, quantity:Number(item.boxCount || 0) * Number(item.piecesPerBox || 0) });

function defaults(invoice?: EditableInvoice | null): InvoiceInput {
  if (!invoice) return { invoiceDate:format(new Date(), "yyyy-MM-dd"), dueDate:format(addDays(new Date(), 30), "yyyy-MM-dd"), clientId:"", paymentMethod:"BANK_TRANSFER", status:"UNPAID", notes:"", items:[blankItem] };
  return {
    invoiceDate:invoice.invoiceDate, dueDate:invoice.dueDate || "", clientId:invoice.clientId || "",
    paymentMethod:invoice.paymentMethod as InvoiceInput["paymentMethod"], status:invoice.status as InvoiceInput["status"], notes:invoice.notes || "",
    items:invoice.items.map((item) => ({ productId:item.productId, productReference:item.productReference || "", productName:item.productName, description:item.description || "", boxCount:Number(item.boxCount), piecesPerBox:Number(item.piecesPerBox), unit:item.unit as InvoiceInput["items"][number]["unit"], unitPriceHt:Number(item.unitPriceHt), vatRate:Number(item.vatRate) })),
  };
}

function useMobileInvoiceLayout() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return mobile;
}

function Field({ label, error, style, children }: { label:string; error?:string; style?:React.CSSProperties; children:React.ReactNode }) {
  return <div className="field" style={style}><label>{label}</label>{children}{error && <span className="field-error">{error}</span>}</div>;
}

function Preview({ data, client, currency, onClose }: { data:InvoiceInput; client?:Client; currency:string; onClose:()=>void }) {
  return <div style={{ position:"fixed", inset:0, zIndex:100, background:"#000b", overflow:"auto", padding:20 }}>
    <div style={{ maxWidth:920, margin:"0 auto 20px", display:"flex", justifyContent:"flex-end" }}><Button variant="secondary" onClick={onClose}><X size={17}/>Fermer l’aperçu</Button></div>
    <div className="invoice-paper">
      <div style={{ display:"flex", justifyContent:"space-between", gap:30, marginBottom:40 }}><div><div style={{ fontWeight:800, fontSize:20, color:"#8a631c" }}>OUDAROUR FOOD</div><p style={{ color:"#777", marginTop:7 }}>SOCIETE OUDAROUR FOOD SARL</p></div><div style={{ textAlign:"right" }}><h1 style={{ fontSize:30, margin:0 }}>FACTURE</h1><p style={{ color:"#777" }}>Numéro généré à l’enregistrement</p></div></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:30, marginBottom:30 }}><div><small style={{ color:"#777", textTransform:"uppercase" }}>Facturé à</small><h3 style={{ margin:"6px 0" }}>{client?.name || "Client"}</h3>{client?.ice && <p>ICE : {client.ice}</p>}</div><div style={{ textAlign:"right" }}><p>Date : <strong>{data.invoiceDate}</strong></p>{data.dueDate && <p>Échéance : <strong>{data.dueDate}</strong></p>}</div></div>
      <table><thead><tr><th>Désignation</th><th>Cartons</th><th>Pièces/carton</th><th>Total pièces</th><th>Prix/pièce HT</th><th>TVA</th><th>Total HT</th></tr></thead><tbody>{data.items.map((item, index) => { const calculated=pricedItem(item); const line=calculateLine(calculated); return <tr key={index}><td><strong>{item.productName || "Produit"}</strong><br/><small>{item.description}</small></td><td>{item.boxCount}</td><td>{item.piecesPerBox}</td><td>{calculated.quantity}</td><td>{formatMoney(item.unitPriceHt, currency)}</td><td>{item.vatRate}%</td><td>{formatMoney(line.totalHt, currency)}</td></tr>; })}</tbody></table>
      <div style={{ width:330, margin:"28px 0 0 auto" }}><InvoiceTotals items={data.items.map(pricedItem)} currency={currency} document showWords/></div>
    </div>
  </div>;
}

export function InvoiceForm({ products, clients, currency="MAD", defaultVat=20, invoice }: { products:Product[]; clients:Client[]; currency?:string; defaultVat?:number; invoice?:EditableInvoice | null }) {
  const router = useRouter();
  const mobile = useMobileInvoiceLayout();
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<InvoiceInput | null>(null);
  const form = useForm<InvoiceInput>({ resolver:zodResolver(invoiceSchema) as Resolver<InvoiceInput>, defaultValues:defaults(invoice), mode:"onBlur" });
  const { register, control, setValue, getValues, handleSubmit, formState:{ errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name:"items" });
  const items = useWatch({ control, name:"items" }) || [];
  const calculatedItems = items.map(pricedItem);
  const clientId = useWatch({ control, name:"clientId" });
  const selectedClient = clients.find((client) => client.id === clientId);

  function selectProduct(index: number, product: Product) {
    setValue(`items.${index}.productId`, product.id, { shouldDirty:true });
    setValue(`items.${index}.productReference`, product.reference, { shouldDirty:true });
    setValue(`items.${index}.productName`, product.name, { shouldDirty:true });
    setValue(`items.${index}.description`, product.description || "", { shouldDirty:true });
    setValue(`items.${index}.unit`, product.unit as InvoiceInput["items"][number]["unit"], { shouldDirty:true });
    setValue(`items.${index}.unitPriceHt`, Number(product.priceHt), { shouldDirty:true });
    setValue(`items.${index}.vatRate`, Number(product.vatRate), { shouldDirty:true });
  }

  const persist = (data: InvoiceInput, status?: InvoiceInput["status"]) => start(async () => {
    const result = await saveInvoiceAction(invoice?.id || null, { ...data, status:status || data.status });
    if (result.success) { toast.success(result.message); router.push(`/factures/${result.id}`); router.refresh(); }
    else toast.error(result.message);
  });
  const submitWith = (status?: InvoiceInput["status"]) => handleSubmit((data) => persist(data, status), () => toast.error("Vérifiez les champs signalés."))();

  const hiddenProductFields = (index: number) => <>
    <input type="hidden" {...register(`items.${index}.productId`)}/>
    <input type="hidden" {...register(`items.${index}.productName`)}/>
    <input type="hidden" {...register(`items.${index}.productReference`)}/>
    <input type="hidden" {...register(`items.${index}.unit`)}/>
    <input type="hidden" {...register(`items.${index}.unitPriceHt`, { valueAsNumber:true })}/>
  </>;

  return <>
    <form onSubmit={handleSubmit((data) => persist(data))}><div className="invoice-layout"><div className="invoice-stack">
      <Card className="section-card"><h2 className="section-title">Informations facture</h2><div className="grid-form">
        <Field label="Date de facture" error={errors.invoiceDate?.message} style={{ gridColumn:"span 3" }}><Input type="date" {...register("invoiceDate")}/></Field>
        <Field label="Date d’échéance" error={errors.dueDate?.message} style={{ gridColumn:"span 3" }}><Input type="date" {...register("dueDate")}/></Field>
        <Field label="Mode de paiement" style={{ gridColumn:"span 3" }}><Select {...register("paymentMethod")}>{Object.entries(PAYMENT_METHODS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <Field label="Statut" style={{ gridColumn:"span 3" }}><Select {...register("status")}>{Object.entries(INVOICE_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
      </div><p style={{ margin:"14px 0 0", color:"var(--muted)", fontSize:12.5 }}>Le numéro sera généré lors de l’enregistrement.</p></Card>

      <Card className="section-card"><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:16 }}><h2 className="section-title" style={{ margin:0 }}>Client</h2><Button asChild type="button" size="sm" variant="secondary"><Link href="/clients"><Plus size={15}/>Gérer les clients</Link></Button></div>
        <Field label="Client *" error={errors.clientId?.message}><Select {...register("clientId")}><option value="">Sélectionner un client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.type === "ENTREPRISE" && client.ice ? ` — ICE ${client.ice}` : " — Particulier"}</option>)}</Select></Field>
        {selectedClient && <div className="client-summary"><div><small>Type</small><strong>{selectedClient.type === "ENTREPRISE" ? "Entreprise" : "Particulier"}</strong></div><div><small>ICE</small><strong>{selectedClient.type === "ENTREPRISE" ? selectedClient.ice : ""}</strong></div><div><small>Téléphone</small><strong>{selectedClient.phone || "—"}</strong></div><div><small>Adresse</small><strong>{selectedClient.address || "—"}</strong></div></div>}
        {clients.length === 0 && <p style={{ color:"var(--muted)", margin:"12px 0 0" }}>Aucun client enregistré. Ajoutez d’abord un client depuis la page Clients.</p>}
      </Card>

      <Card><div style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid var(--border)" }}><div><h2 className="section-title" style={{ margin:0 }}>Produits de la facture</h2><small style={{ color:"var(--muted)" }}>{fields.length} ligne{fields.length > 1 ? "s" : ""}</small></div><Button type="button" size="sm" variant="secondary" onClick={() => append({ ...blankItem, vatRate:defaultVat })}><Plus size={16}/>Ajouter un produit</Button></div>
        {errors.items?.root?.message && <p className="field-error" style={{ padding:"0 20px" }}>{errors.items.root.message}</p>}
        {!mobile && <div className="table-wrap"><table className="data-table" style={{ minWidth:1180 }}><thead><tr><th style={{ width:240 }}>Produit</th><th>Description</th><th>Nb cartons</th><th>Pièces/carton</th><th>Total pièces</th><th>Prix/pièce HT</th><th>TVA</th><th>Total HT</th><th></th></tr></thead><tbody>{fields.map((field, index) => { const item=items[index] || blankItem; const calculated=pricedItem(item); const line=calculateLine(calculated); return <tr key={field.id}><td>{hiddenProductFields(index)}<ProductSelector products={products} value={item.productId} onSelect={(product) => selectProduct(index, product)}/></td><td><Input {...register(`items.${index}.description`)}/></td><td><Input type="number" min="0.001" step="0.001" {...register(`items.${index}.boxCount`, { valueAsNumber:true })}/></td><td><Input type="number" min="1" step="1" {...register(`items.${index}.piecesPerBox`, { valueAsNumber:true })}/></td><td><strong>{calculated.quantity}</strong></td><td><strong>{item.productId ? formatMoney(item.unitPriceHt, currency) : "—"}</strong></td><td><Input type="number" min="0" max="100" step="0.01" {...register(`items.${index}.vatRate`, { valueAsNumber:true })}/></td><td><strong>{formatMoney(line.totalHt, currency)}</strong></td><td><Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(index)} aria-label="Supprimer la ligne"><Trash2 size={16}/></Button></td></tr>; })}</tbody></table></div>}
        {mobile && <div className="invoice-item-cards" style={{ display:"flex", padding:14, flexDirection:"column", gap:12 }}>{fields.map((field, index) => { const item=items[index] || blankItem; const calculated=pricedItem(item); const line=calculateLine(calculated); return <div className="card section-card" key={field.id}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}><strong>Produit {index + 1}</strong><Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(index)} aria-label="Supprimer la ligne"><Trash2 size={16}/></Button></div>{hiddenProductFields(index)}<div className="field"><label>Produit</label><ProductSelector products={products} value={item.productId} onSelect={(product) => selectProduct(index, product)}/></div><div className="grid-form" style={{ marginTop:12 }}><Field label="Description" style={{ gridColumn:"span 12" }}><Input {...register(`items.${index}.description`)}/></Field><Field label="Nombre de cartons" style={{ gridColumn:"span 6" }}><Input type="number" min="0.001" step="0.001" {...register(`items.${index}.boxCount`, { valueAsNumber:true })}/></Field><Field label="Pièces par carton" style={{ gridColumn:"span 6" }}><Input type="number" min="1" step="1" {...register(`items.${index}.piecesPerBox`, { valueAsNumber:true })}/></Field><Field label="Prix par pièce HT" style={{ gridColumn:"span 6" }}><div className="input" style={{ display:"flex", alignItems:"center", background:"var(--surface-soft)" }}>{item.productId ? formatMoney(item.unitPriceHt, currency) : "—"}</div></Field><Field label="TVA %" style={{ gridColumn:"span 6" }}><Input type="number" min="0" max="100" step="0.01" {...register(`items.${index}.vatRate`, { valueAsNumber:true })}/></Field></div><div style={{ display:"flex", justifyContent:"space-between", marginTop:14, paddingTop:12, borderTop:"1px solid var(--border)" }}><span>{calculated.quantity} pièces · Total HT</span><strong>{formatMoney(line.totalHt, currency)}</strong></div></div>; })}</div>}
      </Card>

      <Card className="section-card"><h2 className="section-title">Notes</h2><Textarea {...register("notes")} placeholder="Informations complémentaires visibles sur la facture…"/></Card>
    </div><aside className="card section-card totals-card"><h2 className="section-title">Récapitulatif</h2><InvoiceTotals items={calculatedItems} currency={currency}/><div className="desktop-only" style={{ flexDirection:"column", gap:9, marginTop:22 }}><Button type="submit" disabled={pending}><Save size={17}/>{pending ? "Enregistrement…" : "Enregistrer"}</Button><Button type="button" variant="secondary" disabled={pending} onClick={() => submitWith("DRAFT")}><FileCheck2 size={17}/>Enregistrer comme brouillon</Button><Button type="button" variant="ghost" onClick={() => setPreview(getValues())}><Eye size={17}/>Aperçu</Button><Button type="button" variant="ghost" onClick={() => router.back()}>Annuler</Button></div></aside></div>
      <div className="mobile-actions"><Button type="button" variant="secondary" onClick={() => setPreview(getValues())}><Eye size={17}/>Aperçu</Button><Button type="button" onClick={() => submitWith()} disabled={pending}><Save size={17}/>{pending ? "…" : "Enregistrer"}</Button></div>
    </form>
    {preview && <Preview data={preview} client={clients.find((client) => client.id === preview.clientId)} currency={currency} onClose={() => setPreview(null)}/>}
  </>;
}
