import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMenuItemById,
  getCategoriesByRestaurantId,
} from "@/lib/services/menu-service";
import { MenuItemForm } from "../../new/menu-item-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Menu Item — TableFlow Admin",
  description: "Edit an existing menu item.",
};

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  await requireAuth();
  const { itemId } = await params;

  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .single();

  if (!restaurant) {
    return <p>No restaurant found.</p>;
  }

  const item = await getMenuItemById(restaurant.id, itemId);
  if (!item) {
    notFound();
  }

  const categories = await getCategoriesByRestaurantId(restaurant.id);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit: {item.name}</h1>
          <p className="admin-page-subtitle">
            Update this menu item
          </p>
        </div>
      </div>

      <MenuItemForm categories={categories} mode="edit" item={item} />
    </div>
  );
}
