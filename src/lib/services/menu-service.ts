import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/supabase";

type Restaurant = Tables<"restaurants">;
type MenuCategory = Tables<"menu_categories">;
type MenuItem = Tables<"menu_items">;

export type MenuCategoryWithItems = MenuCategory & {
  items: MenuItem[];
};

/**
 * Fetch a restaurant by its URL slug.
 * Returns null if no restaurant matches.
 */
export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * Fetch all menu categories and items for a restaurant, grouped by category.
 * Categories ordered by display_order; items within each category also ordered.
 */
export async function getMenuByRestaurantId(
  restaurantId: string
): Promise<MenuCategoryWithItems[]> {
  const supabase = createAdminClient();

  // Fetch categories
  const { data: categories, error: catError } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });

  if (catError || !categories) return [];

  // Fetch all items for this restaurant
  const { data: items, error: itemError } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });

  if (itemError) return categories.map((c) => ({ ...c, items: [] }));

  // Group items by category
  return categories.map((category) => ({
    ...category,
    items: (items ?? []).filter((item) => item.category_id === category.id),
  }));
}

/**
 * Create a new menu item. Admin only.
 * Caller must have verified auth and restaurant access.
 */
export async function createMenuItem(
  restaurantId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    category_id: string;
    image_url?: string;
    is_available?: boolean;
  }
): Promise<{ item: MenuItem | null; error?: string }> {
  const supabase = createAdminClient();

  // Get max display_order in category for ordering
  const { data: existing } = await supabase
    .from("menu_items")
    .select("display_order")
    .eq("restaurant_id", restaurantId)
    .eq("category_id", data.category_id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (existing?.display_order ?? 0) + 1;

  const { data: item, error } = await supabase
    .from("menu_items")
    .insert({
      restaurant_id: restaurantId,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      category_id: data.category_id,
      image_url: data.image_url ?? null,
      is_available: data.is_available ?? true,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return { item: null, error: `Failed to create item: ${error.message}` };
  }

  return { item };
}

/**
 * Update an existing menu item. Admin only.
 * Validates restaurant_id match.
 */
export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    category_id?: string;
    image_url?: string | null;
    is_available?: boolean;
  }
): Promise<{ item: MenuItem | null; error?: string }> {
  const supabase = createAdminClient();

  const { data: item, error } = await supabase
    .from("menu_items")
    .update(data)
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .select()
    .single();

  if (error) {
    return { item: null, error: `Failed to update item: ${error.message}` };
  }

  return { item };
}

/**
 * Delete a menu item. Admin only.
 * Validates restaurant_id match.
 */
export async function deleteMenuItem(
  restaurantId: string,
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    return { success: false, error: `Failed to delete item: ${error.message}` };
  }

  return { success: true };
}

/**
 * Toggle availability of a menu item. Admin only.
 */
export async function toggleItemAvailability(
  restaurantId: string,
  itemId: string
): Promise<{ item: MenuItem | null; error?: string }> {
  const supabase = createAdminClient();

  // First get current availability
  const { data: current } = await supabase
    .from("menu_items")
    .select("is_available")
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .single();

  if (!current) {
    return { item: null, error: "Item not found" };
  }

  const { data: item, error } = await supabase
    .from("menu_items")
    .update({ is_available: !current.is_available })
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .select()
    .single();

  if (error) {
    return { item: null, error: `Failed to toggle availability: ${error.message}` };
  }

  return { item };
}

/**
 * Get a single menu item by ID. Validates restaurant_id.
 */
export async function getMenuItemById(
  restaurantId: string,
  itemId: string
): Promise<MenuItem | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .single();

  return data ?? null;
}

/**
 * Get all categories for a restaurant (for admin forms/dropdowns).
 */
export async function getCategoriesByRestaurantId(
  restaurantId: string
): Promise<MenuCategory[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });

  return data ?? [];
}

/**
 * Create a new menu category. Admin only.
 */
export async function createCategory(
  restaurantId: string,
  data: { name: string }
): Promise<{ category: MenuCategory | null; error?: string }> {
  const supabase = createAdminClient();

  // Get max display_order
  const { data: existing } = await supabase
    .from("menu_categories")
    .select("display_order")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (existing?.display_order ?? 0) + 1;

  const { data: category, error } = await supabase
    .from("menu_categories")
    .insert({
      restaurant_id: restaurantId,
      name: data.name,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return { category: null, error: `Failed to create category: ${error.message}` };
  }

  return { category };
}

/**
 * Update a category. Admin only.
 */
export async function updateCategory(
  restaurantId: string,
  categoryId: string,
  data: { name?: string; display_order?: number }
): Promise<{ category: MenuCategory | null; error?: string }> {
  const supabase = createAdminClient();

  const { data: category, error } = await supabase
    .from("menu_categories")
    .update(data)
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId)
    .select()
    .single();

  if (error) {
    return { category: null, error: `Failed to update category: ${error.message}` };
  }

  return { category };
}

/**
 * Delete a category. Admin only.
 * Will fail if category has items (FK constraint).
 */
export async function deleteCategory(
  restaurantId: string,
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("menu_categories")
    .delete()
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    return {
      success: false,
      error: error.message.includes("foreign key")
        ? "Cannot delete category that has menu items. Remove or move items first."
        : `Failed to delete category: ${error.message}`,
    };
  }

  return { success: true };
}

/**
 * Reorder categories by updating display_order for each.
 * Expects an array of { id, display_order } in the new order.
 */
export async function reorderCategories(
  restaurantId: string,
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Update each category's display_order
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("menu_categories")
      .update({ display_order: i + 1 })
      .eq("id", orderedIds[i])
      .eq("restaurant_id", restaurantId);

    if (error) {
      return { success: false, error: `Failed to reorder: ${error.message}` };
    }
  }

  return { success: true };
}
