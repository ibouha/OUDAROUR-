"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Building2, Edit3, ExternalLink, MapPin, Search, Trash2, UserRound, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Client } from "@/lib/db/schema";
import { deleteClientAction, saveClientAction } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

function ClientDialog({ client, onClose }: { client: Client | null | undefined; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [type, setType] = useState<"PARTICULIER" | "ENTREPRISE">((client?.type as "PARTICULIER" | "ENTREPRISE") || "PARTICULIER");
  const editing = Boolean(client);

  function submit(formData: FormData) {
    const input = {
      type,
      name: formData.get("name"),
      ice: type === "ENTREPRISE" ? formData.get("ice") : "",
      phone: formData.get("phone"),
      address: formData.get("address"),
      mapLocation: formData.get("mapLocation"),
    };
    start(async () => {
      const result = await saveClientAction(client?.id || null, input);
      if (result.success) { toast.success(result.message); onClose(); }
      else toast.error(result.message);
    });
  }

  return <Dialog.Root open onOpenChange={(open) => !open && onClose()}><Dialog.Portal>
    <Dialog.Overlay style={{ position:"fixed", inset:0, background:"#0008", zIndex:90 }}/>
    <Dialog.Content className="card" style={{ position:"fixed", zIndex:91, left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(680px,calc(100vw - 28px))", maxHeight:"calc(100vh - 28px)", overflow:"auto", padding:22 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><Dialog.Title style={{ margin:0, fontSize:20 }}>{editing ? "Modifier le client" : "Nouveau client"}</Dialog.Title><Dialog.Description style={{ color:"var(--muted)", marginTop:5 }}>Ces informations seront réutilisées automatiquement dans les factures.</Dialog.Description></div>
        <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Fermer"><X size={19}/></Button></Dialog.Close>
      </div>
      <form action={submit}><div className="grid-form">
        <div className="field" style={{ gridColumn:"span 5" }}><label>Type de client *</label><Select name="type" value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option></Select></div>
        <div className="field" style={{ gridColumn:type === "ENTREPRISE" ? "span 7" : "span 7" }}><label>{type === "ENTREPRISE" ? "Nom de l’entreprise *" : "Nom du particulier *"}</label><Input name="name" required defaultValue={client?.name}/></div>
        {type === "ENTREPRISE" && <div className="field" style={{ gridColumn:"span 6" }}><label>ICE *</label><Input name="ice" required defaultValue={client?.ice || ""} placeholder="Identifiant commun de l’entreprise"/></div>}
        <div className="field" style={{ gridColumn:type === "ENTREPRISE" ? "span 6" : "span 12" }}><label>Téléphone</label><Input name="phone" type="tel" defaultValue={client?.phone || ""}/></div>
        <div className="field" style={{ gridColumn:"span 12" }}><label>Adresse</label><Textarea name="address" defaultValue={client?.address || ""}/></div>
        <div className="field" style={{ gridColumn:"span 12" }}><label>Lien de localisation Google Maps</label><Input name="mapLocation" type="url" defaultValue={client?.mapLocation || ""} placeholder="https://maps.app.goo.gl/…"/></div>
      </div><div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:22 }}><Button type="button" variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button></div></form>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}

export function ClientManager({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [editing, setEditing] = useState<Client | null | undefined>(undefined);
  const [pending, start] = useTransition();
  useEffect(() => { const open = () => setEditing(null); window.addEventListener("new-client", open); return () => window.removeEventListener("new-client", open); }, []);
  const rows = useMemo(() => clients.filter((client) => (!search || `${client.name} ${client.ice || ""} ${client.phone || ""}`.toLowerCase().includes(search.toLowerCase())) && (type === "ALL" || client.type === type)), [clients, search, type]);

  function removeClient(client: Client) {
    if (!confirm(`Supprimer « ${client.name} » ?`)) return;
    start(async () => {
      const result = await deleteClientAction(client.id);
      if (result.success) { toast.success(result.message); router.refresh(); }
      else toast.error(result.message);
    });
  }

  return <>
    <div className="toolbar"><div className="search"><Search size={17} style={{ position:"absolute", left:11, top:11, color:"var(--muted)" }}/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par nom, ICE ou téléphone…"/></div><Select value={type} onChange={(event) => setType(event.target.value)} style={{ width:190 }}><option value="ALL">Tous les clients</option><option value="PARTICULIER">Particuliers</option><option value="ENTREPRISE">Entreprises</option></Select></div>
    <div className="card">{rows.length === 0 ? <EmptyState title="Aucun client enregistré." description="Ajoutez votre premier client pour pouvoir créer une facture." action={<Button onClick={() => setEditing(null)}><UsersRound size={17}/>Ajouter un client</Button>}/> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Client</th><th>Type</th><th>ICE</th><th>Téléphone</th><th>Adresse</th><th>Localisation</th><th style={{ textAlign:"right" }}>Actions</th></tr></thead><tbody>{rows.map((client) => <tr key={client.id}><td><strong>{client.name}</strong></td><td><Badge tone="neutral">{client.type === "ENTREPRISE" ? <><Building2 size={13}/>Entreprise</> : <><UserRound size={13}/>Particulier</>}</Badge></td><td>{client.type === "ENTREPRISE" ? client.ice : <span style={{ color:"var(--muted)" }}>—</span>}</td><td>{client.phone || <span style={{ color:"var(--muted)" }}>—</span>}</td><td style={{ maxWidth:280 }}>{client.address || <span style={{ color:"var(--muted)" }}>—</span>}</td><td>{client.mapLocation ? <a href={client.mapLocation} target="_blank" rel="noreferrer" style={{ color:"var(--gold-dark)", display:"inline-flex", alignItems:"center", gap:5 }}><MapPin size={15}/>Carte<ExternalLink size={12}/></a> : <span style={{ color:"var(--muted)" }}>—</span>}</td><td><div style={{ display:"flex", justifyContent:"flex-end", gap:4 }}><Button variant="ghost" size="icon" onClick={() => setEditing(client)} title="Modifier"><Edit3 size={16}/></Button><Button variant="ghost" size="icon" disabled={pending} onClick={() => removeClient(client)} title="Supprimer"><Trash2 size={16}/></Button></div></td></tr>)}</tbody></table></div>}</div>
    {editing !== undefined && <ClientDialog client={editing} onClose={() => { setEditing(undefined); router.refresh(); }}/>} 
  </>;
}
