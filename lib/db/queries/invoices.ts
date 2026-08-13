import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { clients, companySettings, invoiceItems, invoiceSequences, invoices, products, type Client, type Product } from "@/lib/db/schema";
import { calculateLine, persistedTotals } from "@/lib/money";
import type { InvoiceStatus } from "@/lib/constants";
import type { InvoiceInput } from "@/lib/validation/invoice";

export async function getInvoices(filters?: { search?: string; status?: string; from?: string; to?: string; page?: number }) {
  const conditions = [];
  if (filters?.search) conditions.push(or(ilike(invoices.invoiceNumber, `%${filters.search}%`), ilike(invoices.clientName, `%${filters.search}%`), ilike(invoices.clientIce, `%${filters.search}%`))!);
  if (filters?.status && filters.status !== "ALL") conditions.push(eq(invoices.status, filters.status));
  if (filters?.from) conditions.push(gte(invoices.invoiceDate, filters.from));
  if (filters?.to) conditions.push(lte(invoices.invoiceDate, filters.to));
  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, filters?.page ?? 1);
  const perPage = 20;
  const [rows, [{ count }]] = await Promise.all([
    getDb().select().from(invoices).where(where).orderBy(desc(invoices.invoiceDate), desc(invoices.createdAt)).limit(perPage).offset((page - 1) * perPage),
    getDb().select({ count: sql<number>`count(*)::int` }).from(invoices).where(where),
  ]);
  return { rows, count, page, pages: Math.max(1, Math.ceil(count / perPage)) };
}

export async function getInvoiceById(id: string) {
  const [invoice] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!invoice) return null;
  const items = await getDb().select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)).orderBy(invoiceItems.createdAt);
  return { ...invoice, items };
}

function itemRows(invoiceId: string, input: InvoiceInput, productMap: Map<string, Product>) {
  return input.items.map((item) => {
    const product = item.productId ? productMap.get(item.productId) : null;
    if (!product) throw new Error("Un produit sélectionné est introuvable.");
    const quantity = Number(item.boxCount) * Number(item.piecesPerBox);
    const unitPriceHt = Number(product.priceHt);
    const vatRate = Number(product.vatRate);
    const line = calculateLine({ quantity, unitPriceHt, vatRate });
    return {
      invoiceId, productId: product.id, productReference: product.reference, productName: product.name,
      description: item.description || product.description || null, quantity: quantity.toFixed(3), boxCount: Number(item.boxCount).toFixed(3), piecesPerBox: Number(item.piecesPerBox), unit: product.unit,
      unitPriceHt: unitPriceHt.toFixed(2), discountRate: "0.00", vatRate: vatRate.toFixed(2),
      lineGrossHt: line.grossHt, lineDiscount: line.discount, lineTotalHt: line.totalHt, lineVat: line.vat, lineTotalTtc: line.totalTtc,
    };
  });
}

function invoiceValues(input: InvoiceInput, client: Client, productMap: Map<string, Product>) {
  const totals = persistedTotals(input.items.map((item) => {
    const product = item.productId ? productMap.get(item.productId) : null;
    if (!product) throw new Error("Un produit sélectionné est introuvable.");
    return { quantity:Number(item.boxCount) * Number(item.piecesPerBox), unitPriceHt:Number(product.priceHt), vatRate:Number(product.vatRate) };
  }));
  return {
    invoiceDate: input.invoiceDate, dueDate: input.dueDate || null, clientId: client.id, clientName: client.name,
    clientIce: client.type === "ENTREPRISE" ? client.ice : null, clientIf: null, clientAddress: client.address,
    clientCity: null, clientPhone: client.phone, clientEmail: null, paymentMethod: input.paymentMethod || null,
    status: input.status, notes: input.notes || null, ...totals, updatedAt: new Date(),
  };
}

export async function createInvoice(input: InvoiceInput, createdBy?: string | null) {
  const date = new Date(`${input.invoiceDate}T12:00:00Z`);
  const year = date.getUTCFullYear();
  return getDb().transaction(async (tx) => {
    const [client] = await tx.select().from(clients).where(eq(clients.id, input.clientId)).limit(1);
    if (!client) throw new Error("Le client sélectionné est introuvable.");
    const productIds = input.items.map((item) => item.productId).filter((id): id is string => Boolean(id));
    const selectedProducts = productIds.length ? await tx.select().from(products).where(inArray(products.id, productIds)) : [];
    const productMap = new Map(selectedProducts.map((product) => [product.id, product]));
    if (productMap.size !== new Set(productIds).size || productIds.length !== input.items.length) throw new Error("Sélectionnez un produit valide pour chaque ligne.");
    const [settings] = await tx.select({ prefix: companySettings.invoicePrefix }).from(companySettings).limit(1);
    const prefix = settings?.prefix || "FAC";
    const [sequence] = await tx.insert(invoiceSequences).values({ year, lastNumber: 1 }).onConflictDoUpdate({
      target: invoiceSequences.year,
      set: { lastNumber: sql`${invoiceSequences.lastNumber} + 1` },
    }).returning({ lastNumber: invoiceSequences.lastNumber });
    const invoiceNumber = `${prefix}-${year}-${String(sequence.lastNumber).padStart(4, "0")}`;
    const [invoice] = await tx.insert(invoices).values({ ...invoiceValues(input, client, productMap), invoiceNumber, createdBy: createdBy || null }).returning();
    await tx.insert(invoiceItems).values(itemRows(invoice.id, input, productMap));
    return invoice;
  });
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  return getDb().transaction(async (tx) => {
    const [client] = await tx.select().from(clients).where(eq(clients.id, input.clientId)).limit(1);
    if (!client) throw new Error("Le client sélectionné est introuvable.");
    const productIds = input.items.map((item) => item.productId).filter((id): id is string => Boolean(id));
    const selectedProducts = productIds.length ? await tx.select().from(products).where(inArray(products.id, productIds)) : [];
    const productMap = new Map(selectedProducts.map((product) => [product.id, product]));
    if (productMap.size !== new Set(productIds).size || productIds.length !== input.items.length) throw new Error("Sélectionnez un produit valide pour chaque ligne.");
    const [current] = await tx.select({ status: invoices.status }).from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!current) throw new Error("Facture introuvable.");
    if (!(["DRAFT", "UNPAID"] as string[]).includes(current.status)) throw new Error("Statut non modifiable.");
    const [updated] = await tx.update(invoices).set(invoiceValues(input, client, productMap)).where(and(eq(invoices.id, id), inArray(invoices.status, ["DRAFT", "UNPAID"]))).returning();
    if (!updated) throw new Error("Cette facture ne peut plus être modifiée.");
    await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await tx.insert(invoiceItems).values(itemRows(id, input, productMap));
    return updated;
  });
}

export async function duplicateInvoice(id: string, createdBy?: string | null) {
  const source = await getInvoiceById(id);
  if (!source) throw new Error("Facture introuvable.");
  if (!source.clientId) throw new Error("Cette ancienne facture n’est liée à aucun client. Modifiez-la et choisissez un client avant de la dupliquer.");
  const today = new Date().toISOString().slice(0, 10);
  const input: InvoiceInput = {
    invoiceDate: today, dueDate: "", clientId: source.clientId,
    paymentMethod: source.paymentMethod as InvoiceInput["paymentMethod"], status: "DRAFT", notes: source.notes || "",
    items: source.items.map((item) => ({ productId: item.productId, productReference: item.productReference || "", productName: item.productName, description: item.description || "", boxCount: Number(item.boxCount), piecesPerBox: Number(item.piecesPerBox), unit: item.unit as InvoiceInput["items"][number]["unit"], unitPriceHt: Number(item.unitPriceHt), vatRate: Number(item.vatRate) })),
  };
  return createInvoice(input, createdBy);
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const [updated] = await getDb().update(invoices).set({ status, updatedAt: new Date() }).where(eq(invoices.id, id)).returning();
  return updated ?? null;
}

export async function deleteInvoice(id: string) {
  const [deleted] = await getDb().delete(invoices).where(eq(invoices.id, id)).returning({ id: invoices.id });
  if (!deleted) throw new Error("Facture introuvable.");
  return deleted;
}
