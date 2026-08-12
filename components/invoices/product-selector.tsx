"use client";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/db/schema";
import { PRODUCT_UNITS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";

export function ProductSelector({products,value,onSelect}:{products:Product[];value?:string|null;onSelect:(p:Product)=>void}){
  const[open,setOpen]=useState(false);const[search,setSearch]=useState("");const ref=useRef<HTMLDivElement>(null);const selected=products.find(p=>p.id===value);
  const rows=useMemo(()=>products.filter(p=>`${p.name} ${p.reference} ${p.barcode||""}`.toLowerCase().includes(search.toLowerCase())).slice(0,30),[products,search]);
  return <div ref={ref} style={{position:"relative"}}><Button type="button" variant="secondary" onClick={()=>setOpen(!open)} style={{width:"100%",justifyContent:"space-between",fontWeight:500,overflow:"hidden"}}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{selected?`${selected.reference} — ${selected.name}`:"Sélectionner un produit"}</span><ChevronsUpDown size={15}/></Button>{open&&<><button type="button" aria-label="Fermer" onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:51,border:0,background:"transparent"}}/><div className="card" style={{position:"absolute",zIndex:52,top:"calc(100% + 6px)",left:0,width:"min(430px,85vw)",padding:8,boxShadow:"0 14px 35px #0002"}}><div style={{position:"relative",marginBottom:6}}><Search size={15} style={{position:"absolute",left:10,top:11,color:"var(--muted)"}}/><Input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, référence ou code-barres…" style={{paddingLeft:34}}/></div><div style={{maxHeight:250,overflow:"auto"}}>{rows.length?rows.map(p=><button type="button" key={p.id} onClick={()=>{onSelect(p);setOpen(false);setSearch("")}} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 8px",border:0,borderRadius:7,background:"transparent",color:"var(--foreground)",textAlign:"left",cursor:"pointer"}}><Check size={15} style={{opacity:value===p.id?1:0,color:"var(--gold)"}}/><span style={{flex:1}}><strong style={{display:"block",fontSize:12}}>{p.reference}</strong><span>{p.name}</span></span><small style={{color:"var(--muted)"}}>{formatMoney(p.priceHt)} / {PRODUCT_UNITS[p.unit as keyof typeof PRODUCT_UNITS]}</small></button>):<p style={{color:"var(--muted)",padding:12}}>Aucun produit trouvé.</p>}</div></div></>}</div>
}
