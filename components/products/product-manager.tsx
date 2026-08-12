"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Edit3, MoreHorizontal, PackagePlus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/db/schema";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "@/lib/constants";
import { deleteProductAction, saveProductAction, toggleProductAction } from "@/app/(app)/produits/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney } from "@/lib/money";

function ProductDialog({ product, onClose }: { product: Product | null | undefined; onClose:()=>void }) {
  const [pending,start] = useTransition(); const editing=Boolean(product);
  function submit(formData:FormData) {
    const input={ reference:formData.get("reference"),name:formData.get("name"),description:formData.get("description"),category:formData.get("category"),unit:formData.get("unit"),priceHt:formData.get("priceHt"),vatRate:formData.get("vatRate"),barcode:formData.get("barcode"),imageUrl:formData.get("imageUrl"),isActive:formData.get("isActive")==="on" };
    start(async()=>{const result=await saveProductAction(product?.id||null,input); if(result.success)toast.success(result.message);else toast.error(result.message); if(result.success)onClose();});
  }
  return <Dialog.Root open onOpenChange={(v)=>!v&&onClose()}><Dialog.Portal><Dialog.Overlay style={{ position:"fixed",inset:0,background:"#0008",zIndex:90 }}/><Dialog.Content className="card" style={{ position:"fixed",zIndex:91,left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:"min(650px,calc(100vw - 28px))",maxHeight:"calc(100vh - 28px)",overflow:"auto",padding:22 }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><div><Dialog.Title style={{ margin:0,fontSize:20 }}>{editing?"Modifier le produit":"Nouveau produit"}</Dialog.Title><Dialog.Description style={{ color:"var(--muted)",marginTop:5 }}>{editing?"Mettez à jour les informations du catalogue.":"Ajoutez un produit réutilisable dans vos factures."}</Dialog.Description></div><Dialog.Close asChild><Button variant="ghost" size="icon"><X size={19}/></Button></Dialog.Close></div>
    <form action={submit}><div className="grid-form">
      <div className="field" style={{gridColumn:"span 4"}}><label>Référence *</label><Input name="reference" required defaultValue={product?.reference}/></div><div className="field" style={{gridColumn:"span 8"}}><label>Nom du produit *</label><Input name="name" required defaultValue={product?.name}/></div>
      <div className="field" style={{gridColumn:"span 12"}}><label>Description</label><Textarea name="description" defaultValue={product?.description||""}/></div>
      <div className="field" style={{gridColumn:"span 4"}}><label>Catégorie</label><Select name="category" defaultValue={product?.category||"HONEY"}>{Object.entries(PRODUCT_CATEGORIES).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></div>
      <div className="field" style={{gridColumn:"span 4"}}><label>Unité</label><Select name="unit" defaultValue={product?.unit||"JAR"}>{Object.entries(PRODUCT_UNITS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></div>
      <div className="field" style={{gridColumn:"span 4"}}><label>Prix de vente HT *</label><Input name="priceHt" type="number" min="0.01" step="0.01" required defaultValue={product?.priceHt}/></div>
      <div className="field" style={{gridColumn:"span 4"}}><label>TVA %</label><Input name="vatRate" type="number" min="0" max="100" step="0.01" defaultValue={product?.vatRate||"20"}/></div><div className="field" style={{gridColumn:"span 8"}}><label>Code-barres</label><Input name="barcode" defaultValue={product?.barcode||""}/></div>
      <div className="field" style={{gridColumn:"span 12"}}><label>URL de l’image (facultatif)</label><Input name="imageUrl" type="url" defaultValue={product?.imageUrl||""}/></div>
      <label style={{gridColumn:"span 12",display:"flex",gap:9,alignItems:"center"}}><input type="checkbox" name="isActive" defaultChecked={product?.isActive??true}/> Produit actif</label>
    </div><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:22}}><Button type="button" variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={pending}>{pending?"Enregistrement…":"Enregistrer"}</Button></div></form>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}

export function ProductManager({ products }: { products: Product[] }) {
  const [search,setSearch]=useState("");const[category,setCategory]=useState("ALL");const[status,setStatus]=useState("ALL");const[editing,setEditing]=useState<Product|null|undefined>(undefined);const[page,setPage]=useState(1);const[busy,start]=useTransition();
  useEffect(()=>{const open=()=>setEditing(null);window.addEventListener("new-product",open);return()=>window.removeEventListener("new-product",open)},[]);
  const filtered=useMemo(()=>products.filter(p=>(!search||`${p.name} ${p.reference} ${p.barcode||""}`.toLowerCase().includes(search.toLowerCase()))&&(category==="ALL"||p.category===category)&&(status==="ALL"||(status==="ACTIVE"?p.isActive:!p.isActive))),[products,search,category,status]);const pages=Math.max(1,Math.ceil(filtered.length/10));const rows=filtered.slice((Math.min(page,pages)-1)*10,Math.min(page,pages)*10);
  const run=(fn:()=>Promise<{success:boolean;message:string}>)=>start(async()=>{const r=await fn();if(r.success)toast.success(r.message);else toast.error(r.message)});
  return <><div className="toolbar"><div className="search"><Search size={17} style={{position:"absolute",left:11,top:11,color:"var(--muted)"}}/><Input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Rechercher par nom, référence ou code-barres…"/></div><Select value={category} onChange={e=>setCategory(e.target.value)} style={{width:180}}><option value="ALL">Toutes les catégories</option>{Object.entries(PRODUCT_CATEGORIES).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select><Select value={status} onChange={e=>setStatus(e.target.value)} style={{width:145}}><option value="ALL">Tous les statuts</option><option value="ACTIVE">Actifs</option><option value="INACTIVE">Inactifs</option></Select></div>
    <div className="card">{rows.length===0?<EmptyState title="Aucun produit enregistré." description="Ajoutez votre premier produit pour accélérer la création des factures." action={<Button onClick={()=>setEditing(null)}><PackagePlus size={17}/>Ajouter votre premier produit</Button>}/>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Référence</th><th>Produit</th><th>Catégorie</th><th>Prix HT</th><th>TVA</th><th>Unité</th><th>Statut</th><th style={{textAlign:"right"}}>Actions</th></tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><strong>{p.reference}</strong></td><td><div style={{fontWeight:650}}>{p.name}</div>{p.description&&<small style={{color:"var(--muted)"}}>{p.description}</small>}</td><td>{PRODUCT_CATEGORIES[p.category as keyof typeof PRODUCT_CATEGORIES]}</td><td>{formatMoney(p.priceHt)}</td><td>{Number(p.vatRate)} %</td><td>{PRODUCT_UNITS[p.unit as keyof typeof PRODUCT_UNITS]}</td><td><Badge tone={p.isActive?"success":"neutral"}>{p.isActive?"Actif":"Inactif"}</Badge></td><td><div style={{display:"flex",gap:4,justifyContent:"flex-end"}}><Button variant="ghost" size="icon" onClick={()=>setEditing(p)} title="Modifier"><Edit3 size={16}/></Button><Button variant="ghost" size="icon" disabled={busy} onClick={()=>run(()=>toggleProductAction(p.id,!p.isActive))} title={p.isActive?"Désactiver":"Activer"}><MoreHorizontal size={17}/></Button><Button variant="ghost" size="icon" disabled={busy} onClick={()=>confirm(`Supprimer « ${p.name} » ?`)&&run(()=>deleteProductAction(p.id))} title="Supprimer"><Trash2 size={16}/></Button></div></td></tr>)}</tbody></table></div>}
    {pages>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderTop:"1px solid var(--border)"}}><small style={{color:"var(--muted)"}}>{filtered.length} produits</small><div style={{display:"flex",gap:8}}><Button size="sm" variant="secondary" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Précédent</Button><Button size="sm" variant="secondary" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Suivant</Button></div></div>}</div>
    {editing!==undefined&&<ProductDialog product={editing} onClose={()=>setEditing(undefined)}/>}</>;
}
