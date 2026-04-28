import { logout } from "@/app/actions/auth";

/**
 * Admin dashboard — placeholder page for now.
 * Will be expanded in future milestones with order monitoring, table management, etc.
 */
export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        Dashboard
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Welcome to TableFlow. Your restaurant management features will appear
        here.
      </p>
      <form action={logout}>
        <button
          type="submit"
          id="logout-button"
          style={{
            padding: "0.625rem 1.25rem",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            color: "#f1f5f9",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
