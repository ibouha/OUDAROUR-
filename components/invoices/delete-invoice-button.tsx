"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteInvoiceAction } from "@/app/(app)/factures/actions";
import { Button } from "@/components/ui/button";

export function DeleteInvoiceButton({ id, number }: { id:string; number:string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  function remove() {
    if (!window.confirm(`Supprimer définitivement la facture ${number} ?`)) return;
    start(async () => {
      const result = await deleteInvoiceAction(id);
      if (result.success) { toast.success(result.message); router.refresh(); }
      else toast.error(result.message);
    });
  }
  return <Button size="icon" variant="ghost" onClick={remove} disabled={pending} title="Supprimer la facture" aria-label={`Supprimer ${number}`}><Trash2 size={16}/></Button>;
}
