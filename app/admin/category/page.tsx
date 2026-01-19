// app/admin/category/page.tsx
import AdminCategoryTable from "@/components/admin/AdminCategoryTable";
import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminCategoriesPage() {
  // Disable caching for this page
  noStore();
  
  const res = await fetchCategories();
  const categories = res.data ?? [];

  console.log("frontend categories", categories);

  return (
    <div className="p-6">
      <AdminCategoryTable categories={categories} />
    </div>
  );
}