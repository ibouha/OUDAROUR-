"use client";
import { Button } from "@/components/ui/button";
export function ProductPageAction({children}:{children:React.ReactNode}){return <Button onClick={()=>window.dispatchEvent(new CustomEvent("new-product"))}>{children}</Button>}
