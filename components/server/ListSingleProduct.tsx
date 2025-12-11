import { FRONTEND_URL } from "@/config/env";
import { productType } from "@/types/product";

export const revalidate = 60;
async function getProductBySlug(slug: string): Promise<productType | null> {
  const res = await fetch(`${FRONTEND_URL}/api/product/${slug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data || null;
}

export default async function ListSingleProduct({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  return (
    <div className="space-y-20">
      
    </div>
  );
}   