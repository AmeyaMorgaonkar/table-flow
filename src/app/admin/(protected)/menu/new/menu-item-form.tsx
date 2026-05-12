"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createMenuItemAction,
  updateMenuItemAction,
  type MenuItemFormState,
} from "@/app/actions/menu";
import type { Tables } from "@/types/supabase";
import "../admin-menu.css";

type MenuCategory = Tables<"menu_categories">;
type MenuItem = Tables<"menu_items">;

interface MenuItemFormProps {
  categories: MenuCategory[];
  mode: "create" | "edit";
  item?: MenuItem;
}

/**
 * Shared form component for creating and editing menu items.
 * Uses useActionState for server action integration.
 */
export function MenuItemForm({ categories, mode, item }: MenuItemFormProps) {
  const action =
    mode === "create"
      ? createMenuItemAction
      : updateMenuItemAction.bind(null, item!.id);

  const [state, formAction, isPending] = useActionState<MenuItemFormState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="admin-form">
      {state?.error && (
        <div className="admin-form-error">{state.error}</div>
      )}

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="item-name">
          Name *
        </label>
        <input
          id="item-name"
          name="name"
          type="text"
          className="admin-form-input"
          defaultValue={item?.name ?? ""}
          required
          maxLength={100}
          placeholder="e.g. Margherita Pizza"
        />
        {state?.fieldErrors?.name && (
          <p className="admin-form-field-error">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="item-description">
          Description
        </label>
        <textarea
          id="item-description"
          name="description"
          className="admin-form-textarea"
          defaultValue={item?.description ?? ""}
          maxLength={500}
          placeholder="Brief description of the dish"
        />
        {state?.fieldErrors?.description && (
          <p className="admin-form-field-error">
            {state.fieldErrors.description[0]}
          </p>
        )}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="item-price">
          Price *
        </label>
        <input
          id="item-price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          className="admin-form-input"
          defaultValue={item?.price ?? ""}
          required
          placeholder="299"
        />
        {state?.fieldErrors?.price && (
          <p className="admin-form-field-error">{state.fieldErrors.price[0]}</p>
        )}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="item-category">
          Category *
        </label>
        <select
          id="item-category"
          name="category_id"
          className="admin-form-select"
          defaultValue={item?.category_id ?? ""}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.category_id && (
          <p className="admin-form-field-error">
            {state.fieldErrors.category_id[0]}
          </p>
        )}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="item-image">
          Image URL
        </label>
        <input
          id="item-image"
          name="image_url"
          type="url"
          className="admin-form-input"
          defaultValue={item?.image_url ?? ""}
          placeholder="https://example.com/image.jpg"
        />
        {state?.fieldErrors?.image_url && (
          <p className="admin-form-field-error">
            {state.fieldErrors.image_url[0]}
          </p>
        )}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-checkbox">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={item?.is_available ?? true}
          />
          <span className="admin-form-label" style={{ margin: 0 }}>
            Available for ordering
          </span>
        </label>
      </div>

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isPending}
        >
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Item"
              : "Save Changes"}
        </button>
        <Link href="/admin/menu" className="admin-btn admin-btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
