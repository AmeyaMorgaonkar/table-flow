import Link from "next/link";
import { requireAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategoriesByRestaurantId } from "@/lib/services/menu-service";
import { MenuItemForm } from "./menu-item-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Menu Item — TableFlow Admin",
  description: "Add a new item to your restaurant menu.",
};

export default async function NewMenuItemPage() {
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
          <h1 className="admin-page-title">Add Menu Item</h1>
          <p className="admin-page-subtitle">
            Create a new item for your menu
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="admin-form-error">
          You need to create at least one category before adding menu items.{" "}
          <Link href="/admin/menu/categories" style={{ color: "#1A1A1A", fontWeight: 600 }}>
            Create a category →
          </Link>
        </div>
      ) : (
        <MenuItemForm categories={categories} mode="create" />
      )}
    </div>
  );
}
