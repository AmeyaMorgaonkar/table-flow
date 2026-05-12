import { requireAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategoriesByRestaurantId } from "@/lib/services/menu-service";
import { AdminCategoryManager } from "./category-manager";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories — TableFlow Admin",
  description: "Manage menu categories for your restaurant.",
};

export default async function CategoriesPage() {
  await requireAuth();

  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .single();

  if (!restaurant) {
    return <p>No restaurant found.</p>;
  }

  const categories = await getCategoriesByRestaurantId(restaurant.id);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">
            Manage and reorder your menu categories
          </p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/menu" className="admin-btn admin-btn-secondary">
            ← Back to Menu
          </Link>
        </div>
      </div>

      <AdminCategoryManager initialCategories={categories} />
    </div>
  );
}
