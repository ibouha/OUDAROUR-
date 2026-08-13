ALTER TABLE "delivery_note_items" ADD COLUMN "unit_price_ht" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_note_items" ADD COLUMN "vat_rate" numeric(5, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_note_items" ADD COLUMN "line_total_ht" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_note_items" ADD COLUMN "line_vat" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_note_items" ADD COLUMN "line_total_ttc" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD COLUMN "show_prices" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD COLUMN "total_ht" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD COLUMN "total_vat" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD COLUMN "total_ttc" numeric(12, 2) DEFAULT '0' NOT NULL;