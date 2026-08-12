import { cn } from "@/lib/utils";
export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger"; className?: string }) { return <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>; }
