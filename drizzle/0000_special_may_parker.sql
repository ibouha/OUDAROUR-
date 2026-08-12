CREATE TABLE "company_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"trade_name" text,
	"logo_url" text,
	"address" text,
	"city" text,
	"country" text DEFAULT 'Maroc' NOT NULL,
	"ice" text,
	"tax_id" text,
	"rc" text,
	"cnss" text,
	"phone" text,
	"email" text,
	"website" text,
	"bank_details" text,
	"invoice_prefix" text DEFAULT 'FAC' NOT NULL,
	"default_vat" numeric(5, 2) DEFAULT '20' NOT NULL,
	"currency" text DEFAULT 'MAD' NOT NULL,
	"payment_terms" text,
	"invoice_footer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid,
	"product_reference" text,
	"product_name" text NOT NULL,
	"description" text,
	"quantity" numeric(12, 3) NOT NULL,
	"unit" text,
	"unit_price_ht" numeric(12, 2) NOT NULL,
	"discount_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"vat_rate" numeric(5, 2) NOT NULL,
	"line_gross_ht" numeric(12, 2) NOT NULL,
	"line_discount" numeric(12, 2) NOT NULL,
	"line_total_ht" numeric(12, 2) NOT NULL,
	"line_vat" numeric(12, 2) NOT NULL,
	"line_total_ttc" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_sequences" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date,
	"client_name" text NOT NULL,
	"client_ice" text,
	"client_if" text,
	"client_address" text,
	"client_city" text,
	"client_phone" text,
	"client_email" text,
	"payment_method" text,
	"status" text DEFAULT 'UNPAID' NOT NULL,
	"notes" text,
	"subtotal_ht" numeric(12, 2) NOT NULL,
	"discount_total" numeric(12, 2) NOT NULL,
	"total_ht" numeric(12, 2) NOT NULL,
	"total_vat" numeric(12, 2) NOT NULL,
	"total_ttc" numeric(12, 2) NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"price_ht" numeric(12, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '20' NOT NULL,
	"barcode" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_idx" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_items_product_idx" ON "invoice_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_date_idx" ON "invoices" USING btree ("invoice_date");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_client_idx" ON "invoices" USING btree ("client_name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_reference_idx" ON "products" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");