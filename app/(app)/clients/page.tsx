import type { Metadata } from "next";
import { UserRoundPlus } from "lucide-react";
import { getClients } from "@/lib/db/queries/clients";
import { PageHeader } from "@/components/shared/page-header";
import { ClientManager } from "@/components/clients/client-manager";
import { ClientPageAction } from "@/components/clients/client-page-action";

export const metadata: Metadata = { title:"Clients" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();
  return <div className="page"><PageHeader title="Clients" description={`${clients.length} client${clients.length > 1 ? "s" : ""} enregistré${clients.length > 1 ? "s" : ""}`} action={<ClientPageAction><UserRoundPlus size={17}/>Nouveau client</ClientPageAction>}/><ClientManager clients={clients}/></div>;
}
