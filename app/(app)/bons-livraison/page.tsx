import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardPlus } from "lucide-react";
import { getDeliveryNotes } from "@/lib/db/queries/delivery-notes";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteDeliveryNoteButton } from "@/components/delivery-notes/delete-delivery-note-button";

export const metadata: Metadata = { title:"Bons de livraison" };
export const dynamic = "force-dynamic";
const statuses = { PREPARED:"Préparé", DELIVERED:"Livré", CANCELLED:"Annulé" } as const;

export default async function DeliveryNotesPage() {
  const notes = await getDeliveryNotes();
  return <div className="page"><PageHeader title="Bons de livraison" description={`${notes.length} bon${notes.length > 1 ? "s" : ""} enregistré${notes.length > 1 ? "s" : ""}`} action={<Button asChild><Link href="/bons-livraison/nouveau"><ClipboardPlus size={17}/>Nouveau bon</Link></Button>}/><div className="card">{notes.length === 0 ? <EmptyState title="Aucun bon de livraison." description="Créez votre premier bon pour préparer une expédition." action={<Button asChild><Link href="/bons-livraison/nouveau">Créer un bon</Link></Button>}/> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Numéro</th><th>Date</th><th>Client</th><th>Statut</th><th></th></tr></thead><tbody>{notes.map((note) => <tr key={note.id}><td><Link href={`/bons-livraison/${note.id}`} style={{ fontWeight:720, color:"var(--gold-dark)" }}>{note.deliveryNumber}</Link></td><td>{new Intl.DateTimeFormat("fr-MA").format(new Date(`${note.deliveryDate}T12:00:00`))}</td><td><strong>{note.clientName}</strong>{note.clientIce && <small style={{ display:"block", color:"var(--muted)" }}>ICE {note.clientIce}</small>}</td><td><Badge tone={note.status === "DELIVERED" ? "success" : note.status === "CANCELLED" ? "danger" : "warning"}>{statuses[note.status as keyof typeof statuses]}</Badge></td><td style={{ textAlign:"right" }}><div style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Button size="sm" variant="ghost" asChild><Link href={`/bons-livraison/${note.id}`}>Ouvrir</Link></Button><DeleteDeliveryNoteButton id={note.id} number={note.deliveryNumber}/></div></td></tr>)}</tbody></table></div>}</div></div>;
}
