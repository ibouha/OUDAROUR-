"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string };
export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Saisissez votre email et votre mot de passe." };
  try {
    await signIn("credentials", { email, password, redirectTo: "/factures" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: "Email ou mot de passe incorrect." };
    throw error;
  }
}
