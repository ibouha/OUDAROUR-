"use client";

import Link from "next/link";
import { CheckCircle2, Copy, Download, Edit3, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Invoice, InvoiceItem } from "@/lib/db/schema";
import { duplicateInvoiceAction, changeInvoiceStatusAction } from "@/app/(app)/factures/actions";
import { Button } from "@/components/ui/button";

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

  async function pdf() {
    setExporting(true);
    try {
      const selector = `[data-pdf-invoice="${invoice.id}"]`;
      const invoiceElement = document.querySelector<HTMLElement>(selector);
      if (!invoiceElement) throw new Error("Facture introuvable dans la page.");
      await document.fonts.ready;

      const canvas = await html2canvas(invoiceElement, {
        backgroundColor: "#ffffff",
        logging: false,
        scale: 2,
        useCORS: true,
        windowWidth: 1200,
        onclone: (clonedDocument) => {
          const clonedInvoice = clonedDocument.querySelector<HTMLElement>(selector);
          if (!clonedInvoice) return;
          clonedInvoice.style.width = "900px";
          clonedInvoice.style.maxWidth = "900px";
          clonedInvoice.style.margin = "0";
          clonedInvoice.style.boxShadow = "none";
          clonedInvoice.style.minHeight = `${Math.ceil(900 * 297 / 210)}px`;
          clonedInvoice.style.display = "flex";
          clonedInvoice.style.flexDirection = "column";

          const companyBlock = clonedInvoice.querySelector<HTMLElement>("[data-invoice-company]");
          if (companyBlock) companyBlock.style.display = "none";

          const parties = clonedInvoice.querySelector<HTMLElement>("[data-invoice-parties]");
          if (parties) {
            parties.style.gridTemplateColumns = "1fr";
            parties.style.justifyItems = "center";
            parties.style.marginBottom = "48px";
          }

          const clientBlock = clonedInvoice.querySelector<HTMLElement>("[data-invoice-client]");
          if (clientBlock) {
            clientBlock.style.width = "440px";
            clientBlock.style.minHeight = "0";
            clientBlock.style.padding = "14px 20px 12px";
          }

          const legalFooter = clonedInvoice.querySelector<HTMLElement>(".invoice-legal-footer");
          if (legalFooter) legalFooter.style.marginTop = "auto";
        },
      });

      const doc = new jsPDF({ unit:"mm", format:"a4", orientation:"portrait", compress:true });
      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const pageHeightPx = Math.ceil(canvas.width * pageHeightMm / pageWidthMm);
      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < canvas.height) {
        const remainingHeight = canvas.height - sourceY;
        if (pageIndex > 0 && remainingHeight <= 4) break;
        const sliceHeight = Math.min(pageHeightPx, remainingHeight);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Canvas PDF indisponible.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        if (pageIndex > 0) doc.addPage();
        const sliceHeightMm = sliceHeight * pageWidthMm / canvas.width;
        doc.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidthMm, sliceHeightMm, undefined, "FAST");
        sourceY += sliceHeight;
        pageIndex += 1;
      }

      doc.save(`${invoice.invoiceNumber}.pdf`);
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
  </div>;
}
