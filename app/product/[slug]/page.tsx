import { notFound } from "next/navigation";
import ProductView from "@/components/ProductView";
import { findProduct, products } from "@/lib/products";

export function generateStaticParams() { return products.map((p) => ({ slug: p.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) { const p = findProduct(params.slug); return { title: p?.name ?? "Product", description: p?.description }; }

export default function Page({ params }: { params: { slug: string } }) {
  const p = findProduct(params.slug);
  if (!p) notFound();
  return <ProductView p={p} />;
}
