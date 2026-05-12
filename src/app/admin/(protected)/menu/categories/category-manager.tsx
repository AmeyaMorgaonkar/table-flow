"use client";

import { useState, useTransition, useRef, useActionState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  reorderCategoriesAction,
  type CategoryFormState,
} from "@/app/actions/menu";
import type { Tables } from "@/types/supabase";
import "../admin-menu.css";

type MenuCategory = Tables<"menu_categories">;

interface AdminCategoryManagerProps {
  initialCategories: MenuCategory[];
}

/**
 * Interactive category manager with add, edit, delete, and drag-to-reorder.
 */
export function AdminCategoryManager({
  initialCategories,
}: AdminCategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // ── Add Category ──

  const [addState, addAction, isAdding] = useActionState<CategoryFormState, FormData>(
    async (prev, formData) => {
      const result = await createCategoryAction(prev, formData);
      if (!result?.error) {
        // Refresh the page to get updated categories
        window.location.reload();
      }
      return result;
    },
    undefined
  );

  // ── Edit Category ──

  function startEditing(category: MenuCategory) {
    setEditingId(category.id);
    setEditName(category.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
  }

  function saveEdit(categoryId: string) {
    if (!editName.trim()) return;

    const formData = new FormData();
    formData.append("name", editName.trim());

    startTransition(async () => {
      await updateCategoryAction(categoryId, undefined, formData);
      setEditingId(null);
      window.location.reload();
    });
  }

  // ── Delete Category ──

  function handleDelete(categoryId: string, categoryName: string) {
    if (
      !confirm(
        `Delete category "${categoryName}"? Items in this category must be moved or deleted first.`
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (result?.error) {
        alert(result.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    });
  }

  // ── Drag to Reorder ──

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const reordered = [...categories];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);

    setCategories(reordered);
    dragItem.current = null;
    dragOverItem.current = null;

    // Save new order
    startTransition(async () => {
      await reorderCategoriesAction(reordered.map((c) => c.id));
    });
  }

  return (
    <div className={isPending ? "admin-menu-list--pending" : ""}>
      {/* Add Category Form */}
      <form action={addAction} className="admin-inline-form" style={{ marginBottom: "1.5rem", maxWidth: "560px" }}>
        <input
          name="name"
          type="text"
          className="admin-inline-input"
          placeholder="New category name"
          required
          maxLength={50}
        />
        <button
          type="submit"
          className="admin-inline-btn admin-inline-btn--save"
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </form>

      {addState?.error && (
        <div className="admin-form-error" style={{ maxWidth: "560px", marginBottom: "1rem" }}>
          {addState.error}
        </div>
      )}

      {/* Category List */}
      {categories.length === 0 ? (
        <p style={{ color: "#A1A1AA", fontSize: "0.875rem" }}>
          No categories yet. Add one above to get started.
        </p>
      ) : (
        <div className="admin-categories-list">
          {categories.map((category, index) => (
            <div key={category.id}>
              {editingId === category.id ? (
                /* Edit Mode */
                <div className="admin-inline-form">
                  <input
                    type="text"
                    className="admin-inline-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit(category.id);
                      }
                      if (e.key === "Escape") cancelEditing();
                    }}
                  />
                  <button
                    className="admin-inline-btn admin-inline-btn--save"
                    onClick={() => saveEdit(category.id)}
                  >
                    Save
                  </button>
                  <button
                    className="admin-inline-btn admin-inline-btn--cancel"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Display Mode */
                <div
                  className="admin-category-item"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  id={`category-${category.id}`}
                >
                  <div className="admin-category-info">
                    <span className="admin-category-drag" title="Drag to reorder">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <circle cx="9" cy="5" r="1.5" />
                        <circle cx="15" cy="5" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="19" r="1.5" />
                        <circle cx="15" cy="19" r="1.5" />
                      </svg>
                    </span>
                    <span className="admin-category-name">{category.name}</span>
                    <span className="admin-category-order">#{category.display_order}</span>
                  </div>
                  <div className="admin-category-actions">
                    <button
                      className="admin-icon-btn"
                      onClick={() => startEditing(category)}
                      title="Edit category"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="admin-icon-btn admin-icon-btn--danger"
                      onClick={() => handleDelete(category.id, category.name)}
                      title="Delete category"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
