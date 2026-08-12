"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileClock, FilePlus2, LogOut, Menu, Package, Settings, X } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import logo from "@/public/logo.png";
import Image from "next/image";

const links = [
  { href:"/factures/nouvelle", label:"Nouvelle facture", icon:FilePlus2 },
  { href:"/produits", label:"Produits", icon:Package },
  { href:"/factures", label:"Factures", icon:FileClock },
  { href:"/parametres", label:"Paramètres", icon:Settings },
];

function NavigationLinks({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return <nav style={{ marginTop:26 }}>{links.map(({href,label,icon:Icon}) => {
    const active = href === "/factures" ? pathname === href || (/^\/factures\/[a-f0-9-]+$/.test(pathname)) : pathname.startsWith(href);
    return <Link key={href} href={href} onClick={close} className={`nav-link ${active ? "active" : ""}`}><Icon size={18}/>{label}</Link>;
  })}</nav>;
}

function Brand() { return <Link href="/factures/nouvelle" aria-label="OUDAROUR FOOD — Nouvelle facture" style={{ display:"flex", alignItems:"center", gap:11, padding:"0 7px" }}><Image src={logo} width={74} height={74} priority alt="Logo OUDAROUR FOOD" style={{ width:74, height:74, objectFit:"contain" }}/></Link>; }

export function AppSidebar({ userName, userEmail }: { userName?: string | null; userEmail?: string | null }) {
  return <aside className="sidebar"><Brand/><NavigationLinks/><div style={{ marginTop:"auto", borderTop:"1px solid var(--border)", padding:"17px 8px 0" }}><div style={{ fontWeight:650, overflow:"hidden", textOverflow:"ellipsis" }}>{userName || "Utilisateur"}</div><div style={{ color:"var(--muted)", fontSize:12, overflow:"hidden", textOverflow:"ellipsis" }}>{userEmail}</div><form action={logoutAction}><button className="nav-link" style={{ border:0, background:"transparent", width:"100%", marginTop:10, cursor:"pointer" }}><LogOut size={17}/>Déconnexion</button></form></div></aside>;
}

export function MobileNavigation() {
  const [open,setOpen] = useState(false);
  return <><Button variant="ghost" size="icon" className="mobile-only" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu size={21}/></Button>{open && <div className="mobile-only" style={{ position:"fixed", inset:0, zIndex:80, background:"#0007" }} onClick={() => setOpen(false)}><aside className="sidebar" style={{ display:"flex", width:280 }} onClick={(e) => e.stopPropagation()}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><Brand/><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X size={20}/></Button></div><NavigationLinks close={() => setOpen(false)}/></aside></div>}</>;
}
