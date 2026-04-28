import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Dashboard — TableFlow",
  description: "Manage your restaurant on TableFlow.",
};

/**
 * Protected admin layout.
 * Checks auth server-side — redirects to /admin/login if no session.
 * Login page has its own layout, so it bypasses this check.
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
      {/* Admin nav will be built in a future milestone */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <span className="admin-brand">TableFlow Admin</span>
          <span className="admin-user">{user.email}</span>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
