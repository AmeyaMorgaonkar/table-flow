"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/supabase/auth";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/services/menu-service";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get the restaurant_id for the currently authenticated admin user.
 * For MVP, we find the restaurant associated with this user.
 */
async function getAdminRestaurantId(): Promise<string> {
  await requireAuth();

  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .single();

  if (!restaurant) {
    throw new Error("No restaurant found for this admin user");
  }

  return restaurant.id;
}

// ── Menu Item Actions ──

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive("Price must be positive"),
  category_id: z.string().min(1, "Category is required"),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_available: z.coerce.boolean().optional(),
});

export type MenuItemFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

export async function createMenuItemAction(
  _prevState: MenuItemFormState,
  formData: FormData
): Promise<MenuItemFormState> {
  const restaurantId = await getAdminRestaurantId();

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    image_url: formData.get("image_url") || undefined,
    is_available: formData.get("is_available") === "on",
  });

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const result = await createMenuItem(restaurantId, {
    name: data.name,
    description: data.description,
    price: data.price,
    category_id: data.category_id,
    image_url: data.image_url || undefined,
    is_available: data.is_available ?? true,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function updateMenuItemAction(
  itemId: string,
  _prevState: MenuItemFormState,
  formData: FormData
): Promise<MenuItemFormState> {
  const restaurantId = await getAdminRestaurantId();

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    image_url: formData.get("image_url") || undefined,
    is_available: formData.get("is_available") === "on",
  });

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const result = await updateMenuItem(restaurantId, itemId, {
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    category_id: data.category_id,
    image_url: data.image_url || null,
    is_available: data.is_available ?? true,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function deleteMenuItemAction(itemId: string) {
  const restaurantId = await getAdminRestaurantId();
  const result = await deleteMenuItem(restaurantId, itemId);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu");
}

export async function toggleItemAvailabilityAction(itemId: string) {
  const restaurantId = await getAdminRestaurantId();
  const result = await toggleItemAvailability(restaurantId, itemId);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu");
}

// ── Category Actions ──

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export type CategoryFormState = {
  error?: string;
} | undefined;

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const restaurantId = await getAdminRestaurantId();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] || "Invalid input" };
  }

  const result = await createCategory(restaurantId, { name: parsed.data.name });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu/categories");
  revalidatePath("/admin/menu");
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const restaurantId = await getAdminRestaurantId();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] || "Invalid input" };
  }

  const result = await updateCategory(restaurantId, categoryId, {
    name: parsed.data.name,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu/categories");
  revalidatePath("/admin/menu");
}

export async function deleteCategoryAction(categoryId: string) {
  const restaurantId = await getAdminRestaurantId();
  const result = await deleteCategory(restaurantId, categoryId);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu/categories");
  revalidatePath("/admin/menu");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  const restaurantId = await getAdminRestaurantId();
  const result = await reorderCategories(restaurantId, orderedIds);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/menu/categories");
  revalidatePath("/admin/menu");
}
