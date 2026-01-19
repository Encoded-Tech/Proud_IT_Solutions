
export const revalidate = 0;
import AdminCategoryTable from "@/components/admin/AdminCategoryTable";
import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";




export default async function AdminCategoriesPage() {
  const res = await fetchCategories();
  const categories = res.data ?? [];

  return (
    <div className="p-6">

      <AdminCategoryTable categories={categories} />
    </div>
  );
}
