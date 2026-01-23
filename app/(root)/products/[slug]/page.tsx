import { buildProductSchema } from "@/app/seo/builders/product";
import ListSingleProduct from "@/components/server/ListSingleProduct";
import { fetchProductBySlug } from "@/lib/server/fetchers/fetchProducts";


export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch product for JSON-LD schema
  const res = await fetchProductBySlug(slug);
  const product = res.data;


  // If product not found, fallback (you can also handle 404 here)
  if (!product) return <p>Product not found</p>;

  // Build JSON-LD schema
  const productSchema = buildProductSchema(product);

  return (
    <>
      {/* Inject Product JSON-LD into <head> */}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      </head>

      {/* Render your product UI */}
      <ListSingleProduct slug={slug} />
    </>
  );
}
