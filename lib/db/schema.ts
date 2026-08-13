import { boolean, date, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), name: text("name").notNull(), email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(), isActive: boolean("is_active").default(true).notNull(), ...timestamps,
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(), reference: text("reference").notNull(), name: text("name").notNull(),
  description: text("description"), category: text("category").notNull(), unit: text("unit").notNull(),
  priceHt: numeric("price_ht", { precision: 12, scale: 2 }).notNull(), vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("20").notNull(),
  barcode: text("barcode"), imageUrl: text("image_url"), isActive: boolean("is_active").default(true).notNull(), ...timestamps,
}, (table) => [uniqueIndex("products_reference_idx").on(table.reference), index("products_name_idx").on(table.name), index("products_active_idx").on(table.isActive), index("products_category_idx").on(table.category)]);

export const companySettings = pgTable("company_settings", {
  id: uuid("id").defaultRandom().primaryKey(), companyName: text("company_name").notNull(), tradeName: text("trade_name"), logoUrl: text("logo_url"),
  address: text("address"), city: text("city"), country: text("country").default("Maroc").notNull(), capital: text("capital"), ice: text("ice"), taxId: text("tax_id"), professionalTax: text("professional_tax"), rc: text("rc"), cnss: text("cnss"),
  phone: text("phone"), email: text("email"), website: text("website"), bankDetails: text("bank_details"), invoicePrefix: text("invoice_prefix").default("FAC").notNull(),
  defaultVat: numeric("default_vat", { precision: 5, scale: 2 }).default("20").notNull(), currency: text("currency").default("MAD").notNull(), paymentTerms: text("payment_terms"), invoiceFooter: text("invoice_footer"), ...timestamps,
});

export const invoiceSequences = pgTable("invoice_sequences", { year: integer("year").primaryKey(), lastNumber: integer("last_number").default(0).notNull() });

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").default("PARTICULIER").notNull(),
  name: text("name").notNull(),
  ice: text("ice"),
  phone: text("phone"),
  address: text("address"),
  mapLocation: text("map_location"),
  ...timestamps,
}, (table) => [
  index("clients_name_idx").on(table.name),
  uniqueIndex("clients_ice_idx").on(table.ice),
  index("clients_type_idx").on(table.type),
]);

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(), invoiceNumber: text("invoice_number").notNull(), invoiceDate: date("invoice_date").notNull(), dueDate: date("due_date"),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  clientName: text("client_name").notNull(), clientIce: text("client_ice"), clientIf: text("client_if"), clientAddress: text("client_address"), clientCity: text("client_city"), clientPhone: text("client_phone"), clientEmail: text("client_email"),
  paymentMethod: text("payment_method"), status: text("status").default("UNPAID").notNull(), notes: text("notes"),
  subtotalHt: numeric("subtotal_ht", { precision: 12, scale: 2 }).notNull(), discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).notNull(), totalHt: numeric("total_ht", { precision: 12, scale: 2 }).notNull(), totalVat: numeric("total_vat", { precision: 12, scale: 2 }).notNull(), totalTtc: numeric("total_ttc", { precision: 12, scale: 2 }).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }), ...timestamps,
}, (table) => [uniqueIndex("invoices_number_idx").on(table.invoiceNumber), index("invoices_date_idx").on(table.invoiceDate), index("invoices_status_idx").on(table.status), index("invoices_client_idx").on(table.clientName)]);

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(), invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }), productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productReference: text("product_reference"), productName: text("product_name").notNull(), description: text("description"), quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(), boxCount: numeric("box_count", { precision: 12, scale: 3 }).default("1").notNull(), piecesPerBox: integer("pieces_per_box").default(1).notNull(), unit: text("unit"),
  unitPriceHt: numeric("unit_price_ht", { precision: 12, scale: 2 }).notNull(), discountRate: numeric("discount_rate", { precision: 5, scale: 2 }).default("0").notNull(), vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull(),
  lineGrossHt: numeric("line_gross_ht", { precision: 12, scale: 2 }).notNull(), lineDiscount: numeric("line_discount", { precision: 12, scale: 2 }).notNull(), lineTotalHt: numeric("line_total_ht", { precision: 12, scale: 2 }).notNull(), lineVat: numeric("line_vat", { precision: 12, scale: 2 }).notNull(), lineTotalTtc: numeric("line_total_ttc", { precision: 12, scale: 2 }).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("invoice_items_invoice_idx").on(table.invoiceId), index("invoice_items_product_idx").on(table.productId)]);

export const deliveryNoteSequences = pgTable("delivery_note_sequences", { year: integer("year").primaryKey(), lastNumber: integer("last_number").default(0).notNull() });

export const deliveryNotes = pgTable("delivery_notes", {
  id: uuid("id").defaultRandom().primaryKey(), deliveryNumber: text("delivery_number").notNull(), deliveryDate: date("delivery_date").notNull(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }), clientName: text("client_name").notNull(), clientIce: text("client_ice"),
  status: text("status").default("PREPARED").notNull(), showPrices: boolean("show_prices").default(false).notNull(), notes: text("notes"),
  totalHt: numeric("total_ht", { precision: 12, scale: 2 }).default("0").notNull(), totalVat: numeric("total_vat", { precision: 12, scale: 2 }).default("0").notNull(), totalTtc: numeric("total_ttc", { precision: 12, scale: 2 }).default("0").notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }), ...timestamps,
}, (table) => [uniqueIndex("delivery_notes_number_idx").on(table.deliveryNumber), index("delivery_notes_date_idx").on(table.deliveryDate), index("delivery_notes_client_idx").on(table.clientName)]);

export const deliveryNoteItems = pgTable("delivery_note_items", {
  id: uuid("id").defaultRandom().primaryKey(), deliveryNoteId: uuid("delivery_note_id").notNull().references(() => deliveryNotes.id, { onDelete: "cascade" }), productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productReference: text("product_reference"), productName: text("product_name").notNull(), description: text("description"), boxCount: numeric("box_count", { precision: 12, scale: 3 }).notNull(), piecesPerBox: integer("pieces_per_box").notNull(), totalPieces: numeric("total_pieces", { precision: 12, scale: 3 }).notNull(),
  unitPriceHt: numeric("unit_price_ht", { precision: 12, scale: 2 }).default("0").notNull(), vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("0").notNull(), lineTotalHt: numeric("line_total_ht", { precision: 12, scale: 2 }).default("0").notNull(), lineVat: numeric("line_vat", { precision: 12, scale: 2 }).default("0").notNull(), lineTotalTtc: numeric("line_total_ttc", { precision: 12, scale: 2 }).default("0").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("delivery_note_items_note_idx").on(table.deliveryNoteId), index("delivery_note_items_product_idx").on(table.productId)]);

export type Client = typeof clients.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type DeliveryNote = typeof deliveryNotes.$inferSelect;
export type DeliveryNoteItem = typeof deliveryNoteItems.$inferSelect;
export type CompanySettings = typeof companySettings.$inferSelect;
