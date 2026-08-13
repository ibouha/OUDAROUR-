import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { clients, invoices } from "@/lib/db/schema";
import type { ClientInput } from "@/lib/validation/client";

export async function getClients() {
  return getDb().select().from(clients).orderBy(asc(clients.name));
}

export async function getClientById(id: string) {
  const [client] = await getDb().select().from(clients).where(eq(clients.id, id)).limit(1);
  return client ?? null;
}

function clientValues(data: ClientInput) {
  return {
    type: data.type,
    name: data.name,
    ice: data.type === "ENTREPRISE" ? data.ice || null : null,
    phone: data.phone || null,
    address: data.address || null,
    mapLocation: data.mapLocation || null,
    updatedAt: new Date(),
  };
}

export async function createClient(data: ClientInput) {
  const [created] = await getDb().insert(clients).values(clientValues(data)).returning();
  return created;
}

export async function updateClient(id: string, data: ClientInput) {
  const [updated] = await getDb().update(clients).set(clientValues(data)).where(eq(clients.id, id)).returning();
  return updated ?? null;
}

export async function deleteClient(id: string) {
  const [usage] = await getDb().select({ count: sql<number>`count(*)::int` }).from(invoices).where(eq(invoices.clientId, id));
  if (usage.count > 0) return { deleted: false, used: true };
  await getDb().delete(clients).where(eq(clients.id, id));
  return { deleted: true, used: false };
}
