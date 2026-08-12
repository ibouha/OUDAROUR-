import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", size, asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "icon"; asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", size === "icon" && "icon-btn", className)} {...props} />;
}
