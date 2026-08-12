import type { Metadata } from "next";
import "./globals.css";
import "./invoice-branding.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "OUDAROUR FOOD — Facturation", template: "%s — OUDAROUR FOOD" },
  description: "Gestion simple et sécurisée des factures OUDAROUR FOOD.",
  icons: { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>;
}
