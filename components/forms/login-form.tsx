"use client";
import { useActionState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { loginAction, type LoginState } from "@/app/connexion/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: LoginState = {};
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return <form action={action} style={{ display:"flex", flexDirection:"column", gap:17 }}>
    <div className="field"><label htmlFor="email">Email</label><div style={{ position:"relative" }}><Mail size={16} style={{ position:"absolute", left:12, top:12, color:"var(--muted)" }}/><Input id="email" name="email" type="email" autoComplete="email" required style={{ paddingLeft:38 }} placeholder="nom@oudarour.ma"/></div></div>
    <div className="field"><label htmlFor="password">Mot de passe</label><div style={{ position:"relative" }}><LockKeyhole size={16} style={{ position:"absolute", left:12, top:12, color:"var(--muted)" }}/><Input id="password" name="password" type="password" autoComplete="current-password" required style={{ paddingLeft:38 }} placeholder="Votre mot de passe"/></div></div>
    <label style={{ display:"flex", alignItems:"center", gap:8, color:"var(--muted)", fontSize:13 }}><input type="checkbox" name="remember"/> Se souvenir de moi</label>
    {state.error && <div role="alert" style={{ color:"var(--danger)", background:"color-mix(in srgb,var(--danger) 8%,transparent)", border:"1px solid color-mix(in srgb,var(--danger) 18%,transparent)", borderRadius:8, padding:"10px 12px" }}>{state.error}</div>}
    <Button type="submit" disabled={pending} style={{ width:"100%" }}>{pending ? "Connexion…" : "Se connecter"}</Button>
  </form>;
}
