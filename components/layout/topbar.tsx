"use client";
import { usePathname } from "next/navigation";
import { AppWindow } from "lucide-react";
import { MobileNavigation } from "./app-navigation";

function titleFor(path: string) {
  if (path === "/factures/nouvelle") return "Nouvelle facture";
  if (path.includes("/modifier")) return "Modifier la facture";
  if (path.startsWith("/factures/") ) return "Détail de la facture";
  if (path === "/factures") return "Factures";
  if (path.startsWith("/produits")) return "Produits";
  if (path.startsWith("/bons-livraison/nouveau")) return "Nouveau bon de livraison";
  if (path.startsWith("/bons-livraison")) return "Bons de livraison";
  if (path.startsWith("/parametres")) return "Paramètres";
  return "OUDAROUR FOOD";
}
export function Topbar() { const pathname = usePathname(); return <header className="topbar"><div style={{ display:"flex", alignItems:"center", gap:10 }}><MobileNavigation/><AppWindow className="desktop-only" size={17} color="var(--gold)"/><strong>{titleFor(pathname)}</strong></div></header>; }
