import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { operationsAccess } from "@/lib/operations-access";
import { storeData } from "@/lib/store-data";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: { id: string } }) {
  const { actor, db } = await operationsAccess();
  const { products, status } = await storeData();
  const product = products.find(p => p.id === params.id);
  if (!product) notFound();
  return <AdminShell title="Edit product" authenticated={!!actor}>
    <Link className="admin-table-link" href="/admin/products">← All products</Link>
    {actor?.role === "OWNER" && db && status === "connected" ? <ProductEditor key={`${product.id}-${product.contentVersion}`} product={product} /> : <p className="notice">Sign in as an owner with a connected database to edit this product.</p>}
  </AdminShell>;
}
