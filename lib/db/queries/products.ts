import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { invoiceItems, products } from "@/lib/db/schema";
import type { ProductInput } from "@/lib/validation/product";

export async function getProducts(filters?: { search?: string; category?: string; status?: string }) {
  const conditions = [];
  if (filters?.search) conditions.push(or(ilike(products.name, `%${filters.search}%`), ilike(products.reference, `%${filters.search}%`), ilike(products.barcode, `%${filters.search}%`))!);
  if (filters?.category && filters.category !== "ALL") conditions.push(eq(products.category, filters.category));
  if (filters?.status === "ACTIVE") conditions.push(eq(products.isActive, true));
  if (filters?.status === "INACTIVE") conditions.push(eq(products.isActive, false));
  return getDb().select().from(products).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(products.name));
}

export async function getActiveProducts() {
  return getDb().select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.name));
}

export async function getProductById(id: string) {
  const [product] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
  return product ?? null;
}

function productValues(data: ProductInput) {
  return { ...data, description: data.description || null, barcode: data.barcode || null, imageUrl: data.imageUrl || null, priceHt: data.priceHt.toFixed(2), vatRate: data.vatRate.toFixed(2), updatedAt: new Date() };
}

export async function createProduct(data: ProductInput) {
  const [created] = await getDb().insert(products).values(productValues(data)).returning();
  return created;
}

export async function updateProduct(id: string, data: ProductInput) {
  const [updated] = await getDb().update(products).set(productValues(data)).where(eq(products.id, id)).returning();
  return updated ?? null;
}

export async function deactivateProduct(id: string, isActive: boolean) {
  const [updated] = await getDb().update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, id)).returning();
  return updated ?? null;
}

export async function deleteProduct(id: string) {
  const [usage] = await getDb().select({ count: sql<number>`count(*)::int` }).from(invoiceItems).where(eq(invoiceItems.productId, id));
  if (usage.count > 0) return { deleted: false, used: true };
  await getDb().delete(products).where(eq(products.id, id));
  return { deleted: true, used: false };
}
