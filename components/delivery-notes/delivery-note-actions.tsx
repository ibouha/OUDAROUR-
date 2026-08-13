"use client";

import { Download, Printer, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteDeliveryNoteAction } from "@/app/(app)/bons-livraison/actions";
import { Button } from "@/components/ui/button";
import { downloadDocumentPdf } from "@/lib/pdf/download-document";

export function DeliveryNoteActions({ noteId, deliveryNumber }: { noteId:string; deliveryNumber:string }) {
  const [pending, start] = useTransition();
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  async function pdf() {
    setExporting(true);
    try {
      await downloadDocumentPdf(`[data-pdf-delivery-note="${noteId}"]`, `${deliveryNumber}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de générer le PDF.");
    } finally {
      setExporting(false);
    }
  }

  function remove() {
    if (!window.confirm(`Supprimer définitivement le bon ${deliveryNumber} ?`)) return;
    start(async () => {
      const result = await deleteDeliveryNoteAction(noteId);
      if (result.success) { toast.success(result.message); router.push("/bons-livraison"); router.refresh(); }
      else toast.error(result.message);
    });
  }

  return <div className="no-print" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
    <Button variant="secondary" onClick={pdf} disabled={exporting}><Download size={16}/>{exporting ? "Génération…" : "Télécharger PDF"}</Button>
    <Button onClick={() => window.print()}><Printer size={16}/>Imprimer</Button>
    <Button variant="danger" onClick={remove} disabled={pending}><Trash2 size={16}/>Supprimer</Button>
  </div>;
}
