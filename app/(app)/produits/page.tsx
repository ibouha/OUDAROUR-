import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";
import { getProducts } from "@/lib/db/queries/products";
import { PageHeader } from "@/components/shared/page-header";
import { ProductManager } from "@/components/products/product-manager";
import { ProductPageAction } from "@/components/products/product-page-action";
export const metadata:Metadata={title:"Produits"};export const dynamic="force-dynamic";
export default async function ProductsPage(){const products=await getProducts();return <div className="page"><PageHeader title="Produits" description={`${products.length} produit${products.length>1?"s":""} dans votre catalogue`} action={<ProductPageAction><PackagePlus size={17}/>Nouveau produit</ProductPageAction>}/><ProductManager products={products}/></div>}
