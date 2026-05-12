"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  toggleItemAvailabilityAction,
  deleteMenuItemAction,
} from "@/app/actions/menu";
import type { MenuCategoryWithItems } from "@/lib/services/menu-service";
import "./admin-menu.css";

interface AdminMenuListProps {
  menu: MenuCategoryWithItems[];
}

/**
 * Client component for admin menu list with interactive toggle/delete.
 */
export function AdminMenuList({ menu }: AdminMenuListProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(itemId: string) {
    startTransition(async () => {
      await toggleItemAvailabilityAction(itemId);
    });
  }

  function handleDelete(itemId: string, itemName: string) {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    startTransition(async () => {
      await deleteMenuItemAction(itemId);
    });
  }

  if (menu.length === 0) {
    return (
      <div className="admin-menu-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
          <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h3>No menu items yet</h3>
        <p>Start by creating categories, then add menu items.</p>
        <div className="admin-menu-empty-actions">
          <Link href="/admin/menu/categories" className="admin-btn admin-btn-secondary">
            Create Categories
          </Link>
          <Link href="/admin/menu/new" className="admin-btn admin-btn-primary">
            + Add First Item
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-menu-list ${isPending ? "admin-menu-list--pending" : ""}`}>
      {menu.map((category) => (
        <section key={category.id} className="admin-menu-section">
          <div className="admin-menu-section-header">
            <h2 className="admin-menu-section-title">{category.name}</h2>
            <span className="admin-menu-section-count">
              {category.items.length} item{category.items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {category.items.length === 0 ? (
            <p className="admin-menu-section-empty">
              No items in this category.{" "}
              <Link href="/admin/menu/new">Add one →</Link>
            </p>
          ) : (
            <div className="admin-menu-items">
              {category.items.map((item) => (
                <div key={item.id} className="admin-menu-item" id={`admin-item-${item.id}`}>
                  <div className="admin-menu-item-info">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="admin-menu-item-img"
                      />
                    )}
                    <div className="admin-menu-item-text">
                      <span className="admin-menu-item-name">{item.name}</span>
                      {item.description && (
                        <span className="admin-menu-item-desc">
                          {item.description}
                        </span>
                      )}
                      <span className="admin-menu-item-price">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                  <div className="admin-menu-item-actions">
                    <label className="admin-toggle" title={item.is_available ? "Available" : "Unavailable"}>
                      <input
                        type="checkbox"
                        checked={item.is_available}
                        onChange={() => handleToggle(item.id)}
                      />
                      <span className="admin-toggle-slider" />
                    </label>
                    <Link
                      href={`/admin/menu/${item.id}/edit`}
                      className="admin-icon-btn"
                      title="Edit item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button
                      className="admin-icon-btn admin-icon-btn--danger"
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Delete item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
