import { NextResponse } from "next/server";
import { availability, productImage } from "@/lib/catalogue";
import { storeData } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const { products, status } = await storeData();
  return NextResponse.json({
    status,
    products: products.map(product => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: productImage(product),
      priceKobo: status === "connected" ? product.priceKobo : null,
      maxQuantity: product.stock === null
        ? 99
        : product.enabled ? Math.min(99, product.stock - product.reserved) : 0,
      availability: availability(product),
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
