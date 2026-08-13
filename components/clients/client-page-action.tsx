"use client";

import { Button } from "@/components/ui/button";

export function ClientPageAction({ children }: { children: React.ReactNode }) {
  return <Button onClick={() => window.dispatchEvent(new CustomEvent("new-client"))}>{children}</Button>;
}
