import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-navigation";
import { Topbar } from "@/components/layout/topbar";

export const dynamic = "force-dynamic";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth(); if (!session?.user) redirect("/connexion");
  return <div className="app-shell"><AppSidebar userName={session.user.name} userEmail={session.user.email}/><main className="main-content"><Topbar/>{children}</main></div>;
}
