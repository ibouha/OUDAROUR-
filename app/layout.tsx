import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./invoice-branding.css";
import { Providers } from "@/components/providers";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase:base,
    title:{ default:"OUDAROUR FOOD — Facturation", template:"%s — OUDAROUR FOOD" },
    description:"Gestion simple et sécurisée des factures et clients OUDAROUR FOOD.",
    icons:{ icon:"/logooud1.png", shortcut:"/logooud1.png", apple:"/logooud1.png" },
    openGraph:{ title:"OUDAROUR FOOD", description:"Facturation & gestion clients", images:[{ url:new URL("/og.png", base), width:1731, height:909, alt:"OUDAROUR FOOD — Facturation & gestion clients" }] },
    twitter:{ card:"summary_large_image", title:"OUDAROUR FOOD", description:"Facturation & gestion clients", images:[new URL("/og.png", base)] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" className="light" style={{ colorScheme:"light" }} suppressHydrationWarning><body suppressHydrationWarning><Providers>{children}</Providers></body></html>;
}
