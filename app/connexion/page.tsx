import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/forms/login-form";
import logo from "@/public/logooud1.png";

export const metadata: Metadata = { title:"Connexion" };
export const dynamic = "force-dynamic";
export default async function ConnexionPage() {
  const session = await auth(); if (session?.user) redirect("/factures");
  return <main style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(460px,42%)", background:"var(--surface)" }}>
    <section className="desktop-only" style={{ flexDirection:"column", justifyContent:"space-between", padding:54, background:"#f4edda", color:"#25231d", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:520, height:520, border:"1px solid #a8792238", borderRadius:"50%", right:-210, bottom:-180 }}/><div style={{ position:"absolute", width:360, height:360, border:"1px solid #a8792228", borderRadius:"50%", right:-70, bottom:-100 }}/>
      <div style={{ position:"relative" }}><Image src={logo} width={200} height={200} priority alt="Logo OUDAROUR FOOD" style={{ width:200, height:200, objectFit:"contain" }}/></div>
      <div style={{ position:"relative", maxWidth:620 }}><div style={{ width:42, height:3, background:"#a87922", marginBottom:25 }}/><h1 style={{ fontSize:"clamp(38px,5vw,68px)", lineHeight:1.02, letterSpacing:"-.055em", margin:"0 0 22px", fontWeight:660 }}>La facturation,<br/>simplement maîtrisée.</h1><p style={{ color:"#6f6e68", fontSize:16, lineHeight:1.7, maxWidth:500 }}>Créez, suivez et imprimez vos factures dans un espace fiable conçu pour le quotidien d’OUDAROUR FOOD.</p></div>
      <small style={{ color:"#827b6c", position:"relative" }}>Application interne sécurisée</small>
    </section>
    <section style={{ display:"grid", placeItems:"center", padding:24 }}><div style={{ width:"min(390px,100%)" }}><div className="mobile-only" style={{ justifyContent:"center", marginBottom:30 }}><Image src={logo} width={108} height={108} priority alt="Logo OUDAROUR FOOD" style={{ width:108, height:108, objectFit:"contain" }}/></div><p style={{ color:"var(--gold-dark)", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", fontSize:11.5 }}>Espace privé</p><h2 style={{ fontSize:30, letterSpacing:"-.04em", margin:"7px 0 8px" }}>Bon retour</h2><p style={{ color:"var(--muted)", margin:"0 0 30px" }}>Connectez-vous pour accéder à la facturation.</p><LoginForm/></div></section>
  </main>;
}
