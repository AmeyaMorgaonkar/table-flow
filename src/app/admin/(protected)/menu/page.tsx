import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMenuByRestaurantId } from "@/lib/services/menu-service";
import { requireAuth } from "@/lib/supabase/auth";
import { AdminMenuList } from "./admin-menu-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Management — TableFlow Admin",
  description: "Manage your restaurant menu items and categories.",
};

/**
 * Admin menu management page.
 * Lists all menu items grouped by category with toggle/edit/delete actions.
 */
export default async function AdminMenuPage() {
  await requireAuth();

  // Get the admin's restaurant
  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .single();

  if (!restaurant) {
    return (
      <div className="admin-empty">
        <h2>No Restaurant Found</h2>
        <p>Please set up your restaurant first.</p>
      </div>
    );
  }

  const menu = await getMenuByRestaurantId(restaurant.id);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Menu Management</h1>
          <p className="admin-page-subtitle">
            Manage your menu items and categories
          </p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/menu/categories" className="admin-btn admin-btn-secondary">
            Categories
          </Link>
          <Link href="/admin/menu/new" className="admin-btn admin-btn-primary">
            + Add Item
          </Link>
        </div>
      </div>

      <AdminMenuList menu={menu} />
    </div>
  );
}
