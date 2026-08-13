"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { Client, Product } from "@/lib/db/schema";
import { deliveryNoteSchema, type DeliveryNoteInput } from "@/lib/validation/delivery-note";
import { saveDeliveryNoteAction } from "@/app/(app)/bons-livraison/actions";
import { ProductSelector } from "@/components/invoices/product-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";

const blankItem = { productId:null, productReference:"", productName:"", description:"", boxCount:1, piecesPerBox:1 };

export function DeliveryNoteForm({ clients, products }: { clients:Client[]; products:Product[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<DeliveryNoteInput>({ resolver:zodResolver(deliveryNoteSchema) as Resolver<DeliveryNoteInput>, defaultValues:{ deliveryDate:format(new Date(), "yyyy-MM-dd"), clientId:"", status:"PREPARED", showPrices:false, notes:"", items:[blankItem] } });
  const { register, control, setValue, handleSubmit, formState:{ errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name:"items" });
  const items = useWatch({ control, name:"items" }) || [];

  function selectProduct(index:number, product:Product) {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.productReference`, product.reference);
    setValue(`items.${index}.productName`, product.name);
    setValue(`items.${index}.description`, product.description || "");
  }

  function submit(data:DeliveryNoteInput) {
    start(async () => {
      const result = await saveDeliveryNoteAction(data);
      if (result.success) { toast.success(result.message); router.push(`/bons-livraison/${result.id}`); router.refresh(); }
      else toast.error(result.message);
    });
  }

  return <form onSubmit={handleSubmit(submit, () => toast.error("Vérifiez les champs signalés."))}><div className="invoice-stack">
    <Card className="section-card"><h2 className="section-title">Informations du bon</h2><div className="grid-form"><div className="field" style={{ gridColumn:"span 4" }}><label>Date *</label><Input type="date" {...register("deliveryDate")}/></div><div className="field" style={{ gridColumn:"span 4" }}><label>Client *</label><Select {...register("clientId")}><option value="">Sélectionner un client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.ice ? ` — ICE ${client.ice}` : ""}</option>)}</Select>{errors.clientId?.message && <span className="field-error">{errors.clientId.message}</span>}</div><div className="field" style={{ gridColumn:"span 4" }}><label>Statut</label><Select {...register("status")}><option value="PREPARED">Préparé</option><option value="DELIVERED">Livré</option><option value="CANCELLED">Annulé</option></Select></div><label style={{ gridColumn:"span 12", display:"flex", alignItems:"center", gap:9, padding:"12px 14px", border:"1px solid var(--border)", borderRadius:8, background:"var(--surface-soft)", cursor:"pointer" }}><input type="checkbox" {...register("showPrices")}/><span><strong>Afficher les prix sur le bon</strong><small style={{ display:"block", marginTop:3, color:"var(--muted)" }}>Ajoute le prix par pièce, la TVA et les totaux HT/TTC au document imprimé.</small></span></label></div></Card>
    <Card><div style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid var(--border)" }}><div><h2 className="section-title" style={{ margin:0 }}>Produits à livrer</h2><small style={{ color:"var(--muted)" }}>{fields.length} ligne{fields.length > 1 ? "s" : ""}</small></div><Button type="button" size="sm" variant="secondary" onClick={() => append(blankItem)}><Plus size={16}/>Ajouter un produit</Button></div>
      <div className="table-wrap"><table className="data-table" style={{ minWidth:900 }}><thead><tr><th>Produit</th><th>Description</th><th>Nb cartons</th><th>Pièces/carton</th><th>Total pièces</th><th></th></tr></thead><tbody>{fields.map((field, index) => { const item=items[index] || blankItem; return <tr key={field.id}><td><input type="hidden" {...register(`items.${index}.productId`)}/><input type="hidden" {...register(`items.${index}.productReference`)}/><input type="hidden" {...register(`items.${index}.productName`)}/><ProductSelector products={products} value={item.productId} onSelect={(product) => selectProduct(index, product)}/></td><td><Input {...register(`items.${index}.description`)}/></td><td><Input type="number" min="0.001" step="0.001" {...register(`items.${index}.boxCount`, { valueAsNumber:true })}/></td><td><Input type="number" min="1" step="1" {...register(`items.${index}.piecesPerBox`, { valueAsNumber:true })}/></td><td><strong>{Number(item.boxCount || 0) * Number(item.piecesPerBox || 0)}</strong></td><td><Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}><Trash2 size={16}/></Button></td></tr>; })}</tbody></table></div>
    </Card>
    <Card className="section-card"><h2 className="section-title">Notes</h2><Textarea {...register("notes")} placeholder="Instructions de livraison…"/></Card>
    <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}><Button type="button" variant="secondary" onClick={() => router.back()}>Annuler</Button><Button disabled={pending}><Save size={17}/>{pending ? "Enregistrement…" : "Enregistrer le bon"}</Button></div>
  </div></form>;
}
