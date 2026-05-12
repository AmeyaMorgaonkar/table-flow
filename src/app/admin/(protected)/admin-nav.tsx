"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/tables", label: "Tables" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/kitchen", label: "Kitchen" },
];

/**
 * Admin navigation bar with active link highlighting.
 * Client component to read the current pathname.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      {NAV_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav-link ${isActive ? "admin-nav-link--active" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
