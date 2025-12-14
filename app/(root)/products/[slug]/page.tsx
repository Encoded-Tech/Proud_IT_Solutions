import ListSingleProduct from "@/components/server/ListSingleProduct";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ListSingleProduct slug={slug} />;
}
