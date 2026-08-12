export const PRODUCT_CATEGORIES = { HONEY: "Miel", JAM: "Confiture", SYRUP: "Sirop", OTHER: "Autre" } as const;
export const PRODUCT_UNITS = { PIECE: "Pièce", KG: "Kg", LITER: "Litre", CARTON: "Carton", JAR: "Pot", BOTTLE: "Bouteille" } as const;
export const INVOICE_STATUSES = { DRAFT: "Brouillon", UNPAID: "Non payée", PARTIALLY_PAID: "Partiellement payée", PAID: "Payée", CANCELLED: "Annulée" } as const;
export const PAYMENT_METHODS = { CASH: "Espèces", BANK_TRANSFER: "Virement bancaire", CHECK: "Chèque", CARD: "Carte bancaire", BILL_OF_EXCHANGE: "Traite", OTHER: "Autre" } as const;
export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;
export type ProductUnit = keyof typeof PRODUCT_UNITS;
export type InvoiceStatus = keyof typeof INVOICE_STATUSES;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;
