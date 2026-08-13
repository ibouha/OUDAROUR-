"use client";

import Link from "next/link";
import { CheckCircle2, Copy, Download, Edit3, Printer, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Invoice, InvoiceItem } from "@/lib/db/schema";
import { duplicateInvoiceAction, changeInvoiceStatusAction, deleteInvoiceAction } from "@/app/(app)/factures/actions";
import { Button } from "@/components/ui/button";
import { downloadDocumentPdf } from "@/lib/pdf/download-document";

type FullInvoice = Invoice & { items: InvoiceItem[] };

export function InvoiceActions({ invoice }: { invoice: FullInvoice }) {
  const [pending, start] = useTransition();
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const duplicate = () => start(async () => {
    const result = await duplicateInvoiceAction(invoice.id);
    if (result.success) { toast.success(result.message); router.push(`/factures/${result.id}`); }
    else toast.error(result.message);
  });

  const markPaid = () => start(async () => {
    const result = await changeInvoiceStatusAction(invoice.id, "PAID");
    if (result.success) { toast.success(result.message); router.refresh(); }
    else toast.error(result.message);
  });

  const remove = () => {
    if (!window.confirm(`Supprimer définitivement la facture ${invoice.invoiceNumber} ?`)) return;
    start(async () => {
      const result = await deleteInvoiceAction(invoice.id);
      if (result.success) { toast.success(result.message); router.push("/factures"); router.refresh(); }
      else toast.error(result.message);
    });
  };

  async function pdf() {
    setExporting(true);
    try {
      await downloadDocumentPdf(`[data-pdf-invoice="${invoice.id}"]`, `${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de générer le PDF.");
    } finally {
      setExporting(false);
    }
  }

  return <div className="no-print" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
    {["DRAFT","UNPAID"].includes(invoice.status)&&<Button variant="secondary" asChild><Link href={`/factures/${invoice.id}/modifier`}><Edit3 size={16}/>Modifier</Link></Button>}
    <Button variant="secondary" onClick={duplicate} disabled={pending}><Copy size={16}/>Dupliquer</Button>
    {invoice.status!=="PAID"&&invoice.status!=="CANCELLED"&&<Button variant="secondary" onClick={markPaid} disabled={pending}><CheckCircle2 size={16}/>Marquer payée</Button>}
    <Button variant="secondary" onClick={pdf} disabled={exporting}><Download size={16}/>{exporting?"Génération…":"Télécharger PDF"}</Button>
    <Button onClick={()=>window.print()}><Printer size={16}/>Imprimer</Button>
    <Button variant="danger" onClick={remove} disabled={pending}><Trash2 size={16}/>Supprimer</Button>
  </div>;
}
