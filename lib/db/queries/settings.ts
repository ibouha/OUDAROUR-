import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { companySettings } from "@/lib/db/schema";
import type { SettingsInput } from "@/lib/validation/settings";

export const defaultSettings = {
  companyName: "SOCIETE OUDAROUR FOOD SARL", tradeName: "OUDAROUR FOOD", logoUrl: null, address: null, city: null,
  country: "Maroc", capital: null, ice: null, taxId: null, professionalTax: null, rc: null, cnss: null, phone: null, email: null, website: null, bankDetails: null,
  invoicePrefix: "FAC", defaultVat: "20.00", currency: "MAD", paymentTerms: "Paiement à 30 jours.", invoiceFooter: "Merci pour votre confiance.",
};

export async function getCompanySettings() {
  const [settings] = await getDb().select().from(companySettings).limit(1);
  return settings ?? null;
}

export async function updateCompanySettings(data: SettingsInput) {
  const values = { ...data, logoUrl: data.logoUrl || null, address: data.address || null, city: data.city || null, capital: data.capital || null, ice: data.ice || null, taxId: data.taxId || null, professionalTax: data.professionalTax || null, rc: data.rc || null, cnss: data.cnss || null, phone: data.phone || null, email: data.email || null, website: data.website || null, bankDetails: data.bankDetails || null, paymentTerms: data.paymentTerms || null, invoiceFooter: data.invoiceFooter || null, defaultVat: data.defaultVat.toFixed(2), updatedAt: new Date() };
  const [current] = await getDb().select({ id: companySettings.id }).from(companySettings).limit(1);
  if (current) {
    const [updated] = await getDb().update(companySettings).set(values).where(eq(companySettings.id, current.id)).returning();
    return updated;
  }
  const [created] = await getDb().insert(companySettings).values(values).returning();
  return created;
}
