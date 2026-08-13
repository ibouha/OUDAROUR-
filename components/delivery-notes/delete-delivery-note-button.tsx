"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteDeliveryNoteAction } from "@/app/(app)/bons-livraison/actions";
import { Button } from "@/components/ui/button";

export function DeleteDeliveryNoteButton({ id, number }: { id:string; number:string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  function remove() {
    if (!window.confirm(`Supprimer définitivement le bon ${number} ?`)) return;
    start(async () => {
      const result = await deleteDeliveryNoteAction(id);
      if (result.success) { toast.success(result.message); router.refresh(); }
      else toast.error(result.message);
    });
  }
  return <Button size="icon" variant="ghost" onClick={remove} disabled={pending} title="Supprimer le bon" aria-label={`Supprimer ${number}`}><Trash2 size={16}/></Button>;
}
