// app/admin/category/page.tsx
import AdminCategoryTable from "@/components/admin/AdminCategoryTable";
import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import { connection } from "next/server";

export default async function AdminCategoriesPage() {
  await connection();
  const res = await fetchCategories();
  const categories = res.data ?? [];

  return (
    <div className="p-6">
      <AdminCategoryTable categories={categories} />
    </div>
  );
}
