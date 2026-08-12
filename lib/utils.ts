import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeMessage(error: unknown, fallback = "Une erreur est survenue.") {
  console.error(error);
  return fallback;
}
