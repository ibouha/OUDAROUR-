"use client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function AppError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="page"><div className="card empty-state"><AlertTriangle size={32} color="var(--danger)"/><h3>Impossible de charger cette page.</h3><p>Vérifiez la connexion à la base de données puis réessayez.</p><Button onClick={reset}><RotateCcw size={16}/>Réessayer</Button></div></div>}
