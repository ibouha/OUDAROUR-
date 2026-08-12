import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/constants";
export function InvoiceStatusBadge({ status }: { status: string }) {
  const tone = status === "PAID" ? "success" : status === "UNPAID" || status === "PARTIALLY_PAID" ? "warning" : status === "CANCELLED" ? "danger" : "neutral";
  return <Badge tone={tone}>{INVOICE_STATUSES[status as InvoiceStatus] || status}</Badge>;
}
