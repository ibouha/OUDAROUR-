import type { Metadata } from "next";
import { getClients } from "@/lib/db/queries/clients";
import { getActiveProducts } from "@/lib/db/queries/products";
import { PageHeader } from "@/components/shared/page-header";
import { DeliveryNoteForm } from "@/components/delivery-notes/delivery-note-form";

export const metadata: Metadata = { title:"Nouveau bon de livraison" };
export const dynamic = "force-dynamic";

export default async function NewDeliveryNotePage() {
  const [clients, products] = await Promise.all([getClients(), getActiveProducts()]);
  return <div className="page"><PageHeader title="Nouveau bon de livraison" description="Préparez les cartons et les quantités à livrer au client."/><DeliveryNoteForm clients={clients} products={products}/></div>;
}
