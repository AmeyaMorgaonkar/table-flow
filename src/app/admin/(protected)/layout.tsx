import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { AdminNav } from "./admin-nav";
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — TableFlow",
  description: "Manage your restaurant on TableFlow.",
};

/**
 * Protected admin layout.
 * Checks auth server-side — redirects to /admin/login if no session.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <span className="admin-brand">TableFlow</span>
            <AdminNav />
          </div>
          <a href="/admin/account" className="admin-avatar" title={user.email ?? "Account"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </a>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
