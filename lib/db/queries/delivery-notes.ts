import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { clients, deliveryNoteItems, deliveryNotes, deliveryNoteSequences, products } from "@/lib/db/schema";
import { calculateLine, persistedTotals } from "@/lib/money";
import type { DeliveryNoteInput } from "@/lib/validation/delivery-note";

export async function getDeliveryNotes() {
  return getDb().select().from(deliveryNotes).orderBy(desc(deliveryNotes.deliveryDate), desc(deliveryNotes.createdAt));
}

export async function getDeliveryNoteById(id: string) {
  const [note] = await getDb().select().from(deliveryNotes).where(eq(deliveryNotes.id, id)).limit(1);
  if (!note) return null;
  const items = await getDb().select().from(deliveryNoteItems).where(eq(deliveryNoteItems.deliveryNoteId, id)).orderBy(deliveryNoteItems.createdAt);
  return { ...note, items };
}

export async function createDeliveryNote(input: DeliveryNoteInput, createdBy?: string | null) {
  const year = new Date(`${input.deliveryDate}T12:00:00Z`).getUTCFullYear();
  return getDb().transaction(async (tx) => {
    const [client] = await tx.select().from(clients).where(eq(clients.id, input.clientId)).limit(1);
    if (!client) throw new Error("Le client sélectionné est introuvable.");
    const productIds = input.items.map((item) => item.productId).filter((id): id is string => Boolean(id));
    const selectedProducts = productIds.length ? await tx.select().from(products).where(inArray(products.id, productIds)) : [];
    const productMap = new Map(selectedProducts.map((product) => [product.id, product]));
    if (productMap.size !== new Set(productIds).size || productIds.length !== input.items.length) throw new Error("Sélectionnez un produit valide pour chaque ligne.");
    const pricedItems = input.items.map((item) => {
      const product = productMap.get(item.productId!);
      if (!product) throw new Error("Produit introuvable.");
      return { quantity:Number(item.boxCount) * Number(item.piecesPerBox), unitPriceHt:Number(product.priceHt), vatRate:Number(product.vatRate) };
    });
    const totals = persistedTotals(pricedItems);
    const [sequence] = await tx.insert(deliveryNoteSequences).values({ year, lastNumber:1 }).onConflictDoUpdate({ target:deliveryNoteSequences.year, set:{ lastNumber:sql`${deliveryNoteSequences.lastNumber} + 1` } }).returning({ lastNumber:deliveryNoteSequences.lastNumber });
    const deliveryNumber = `BL-${year}-${String(sequence.lastNumber).padStart(4, "0")}`;
    const [note] = await tx.insert(deliveryNotes).values({ deliveryNumber, deliveryDate:input.deliveryDate, clientId:client.id, clientName:client.name, clientIce:client.type === "ENTREPRISE" ? client.ice : null, status:input.status, showPrices:input.showPrices, notes:input.notes || null, totalHt:totals.totalHt, totalVat:totals.totalVat, totalTtc:totals.totalTtc, createdBy:createdBy || null }).returning();
    await tx.insert(deliveryNoteItems).values(input.items.map((item, index) => { const product=productMap.get(item.productId!)!; const line=calculateLine(pricedItems[index]); return { deliveryNoteId:note.id, productId:product.id, productReference:product.reference, productName:product.name, description:item.description || product.description || null, boxCount:Number(item.boxCount).toFixed(3), piecesPerBox:Number(item.piecesPerBox), totalPieces:pricedItems[index].quantity.toFixed(3), unitPriceHt:Number(product.priceHt).toFixed(2), vatRate:Number(product.vatRate).toFixed(2), lineTotalHt:line.totalHt, lineVat:line.vat, lineTotalTtc:line.totalTtc }; }));
    return note;
  });
}

export async function deleteDeliveryNote(id: string) {
  const [deleted] = await getDb().delete(deliveryNotes).where(eq(deliveryNotes.id, id)).returning({ id: deliveryNotes.id });
  if (!deleted) throw new Error("Bon de livraison introuvable.");
  return deleted;
}
