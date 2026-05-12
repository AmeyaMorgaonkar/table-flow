import { getServerUser } from "@/lib/supabase/auth";
import { logout } from "@/app/actions/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — TableFlow Admin",
  description: "Manage your account and role settings.",
};

const ROLE_LABELS: Record<string, { label: string; description: string; color: string }> = {
  admin: {
    label: "Admin",
    description: "Full access to all restaurant settings, menu, tables, and reports.",
    color: "#1A1A1A",
  },
  waiter: {
    label: "Waiter",
    description: "Can open/close table sessions and view the kitchen dashboard.",
    color: "#2563EB",
  },
  cook: {
    label: "Cook",
    description: "Access to the kitchen dashboard to manage incoming orders.",
    color: "#D97706",
  },
  manager: {
    label: "Manager",
    description: "Can manage menu, view reports, and oversee table operations.",
    color: "#7C3AED",
  },
};

export default async function AccountPage() {
  const user = await getServerUser();

  // For MVP, role is derived from user metadata or defaults to "admin"
  const role = (user?.user_metadata?.role as string) || "admin";
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.admin;

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Account</h1>
          <p className="admin-page-subtitle">
            Your profile and role information
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "720px" }}>
        {/* Profile Card */}
        <div className="admin-card">
          <h2 className="account-section-title">Profile</h2>
          <div className="account-rows">
            <div className="account-row">
              <span className="account-row-label">Email</span>
              <span className="account-row-value">{user?.email || "—"}</span>
            </div>
            <div className="account-row">
              <span className="account-row-label">Member since</span>
              <span className="account-row-value">{createdAt}</span>
            </div>
            <div className="account-row">
              <span className="account-row-label">User ID</span>
              <span className="account-row-value account-row-value--mono">
                {user?.id?.slice(0, 8)}…
              </span>
            </div>
          </div>
        </div>

        {/* Role Card */}
        <div className="admin-card">
          <h2 className="account-section-title">Role</h2>
          <div className="account-role">
            <span
              className="account-role-badge"
              style={{ background: `${roleInfo.color}12`, color: roleInfo.color, borderColor: `${roleInfo.color}30` }}
            >
              {roleInfo.label}
            </span>
            <p className="account-role-desc">{roleInfo.description}</p>
          </div>
          <div className="account-roles-list">
            <p className="account-roles-title">All roles</p>
            {Object.entries(ROLE_LABELS).map(([key, info]) => (
              <div key={key} className={`account-roles-item ${key === role ? "account-roles-item--active" : ""}`}>
                <span
                  className="account-roles-dot"
                  style={{ background: info.color }}
                />
                <span className="account-roles-name">{info.label}</span>
                {key === role && (
                  <span className="account-roles-current">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div style={{ marginTop: "2rem", maxWidth: "720px" }}>
        <div className="admin-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A1A", margin: "0 0 0.125rem" }}>
              Sign out
            </p>
            <p style={{ fontSize: "0.8125rem", color: "#A1A1AA", margin: 0 }}>
              End your current session on this device.
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="admin-btn admin-btn-danger"
              id="logout-button"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
