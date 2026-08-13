CREATE TABLE "delivery_note_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_note_id" uuid NOT NULL,
	"product_id" uuid,
	"product_reference" text,
	"product_name" text NOT NULL,
	"description" text,
	"box_count" numeric(12, 3) NOT NULL,
	"pieces_per_box" integer NOT NULL,
	"total_pieces" numeric(12, 3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_note_sequences" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_number" text NOT NULL,
	"delivery_date" date NOT NULL,
	"client_id" uuid,
	"client_name" text NOT NULL,
	"client_ice" text,
	"status" text DEFAULT 'PREPARED' NOT NULL,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "box_count" numeric(12, 3) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "pieces_per_box" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
UPDATE "invoice_items" SET "box_count" = "quantity", "pieces_per_box" = 1;--> statement-breakpoint
ALTER TABLE "delivery_note_items" ADD CONSTRAINT "delivery_note_items_delivery_note_id_delivery_notes_id_fk" FOREIGN KEY ("delivery_note_id") REFERENCES "public"."delivery_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_note_items" ADD CONSTRAINT "delivery_note_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "delivery_note_items_note_idx" ON "delivery_note_items" USING btree ("delivery_note_id");--> statement-breakpoint
CREATE INDEX "delivery_note_items_product_idx" ON "delivery_note_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "delivery_notes_number_idx" ON "delivery_notes" USING btree ("delivery_number");--> statement-breakpoint
CREATE INDEX "delivery_notes_date_idx" ON "delivery_notes" USING btree ("delivery_date");--> statement-breakpoint
CREATE INDEX "delivery_notes_client_idx" ON "delivery_notes" USING btree ("client_name");
