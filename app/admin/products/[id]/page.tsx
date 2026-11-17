import { InventoryEditor } from "@/components/admin/InventoryEditor";
import { hasPermission } from "@/lib/admin-permissions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { operationsAccess } from "@/lib/operations-access";
import { storeData } from "@/lib/store-data";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: { id: string } }) {
  const { actor, db } = await operationsAccess("products.view");
  const { products, status } = await storeData();
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();
  return (
    <AdminShell title="Edit product" authenticated={!!actor}>
      <Link className="admin-table-link" href="/admin/products">
        ← All products
      </Link>
      {actor &&
      hasPermission(actor, "products.edit") &&
      db &&
      status === "connected" ? (
        <ProductEditor
          key={`${product.id}-${product.contentVersion}`}
          product={product}
        />
      ) : (
        <p className="notice">
          Product content editing requires permission and a connected database.
        </p>
      )}
      {actor &&
        hasPermission(actor, "inventory.view") &&
        status === "connected" && (
          <>
            <h2>Inventory & pricing</h2>
            <InventoryEditor product={product} />
          </>
        )}
    </AdminShell>
  );
}
