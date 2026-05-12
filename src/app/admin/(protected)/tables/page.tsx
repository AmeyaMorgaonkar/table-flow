"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import "./tables.css";

interface TableWithSession {
  id: string;
  label: string;
  restaurant_id: string;
  qr_code_url: string | null;
  activeSession: {
    id: string;
    otp: string;
    status: string;
    opened_at: string;
    closed_at?: string | null;
    otp_attempts: number;
  } | null;
  lastSession: {
    id: string;
    otp: string;
    status: string;
    opened_at: string;
    closed_at?: string | null;
    otp_attempts: number;
  } | null;
}

type TableGroup =
  | "Normal Tables"
  | "Patio Tables"
  | "Bar Tables"
  | "Private Dining"
  | "Other Tables";

export default function TablesPage() {
  const [tables, setTables] = useState<TableWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableWithSession | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // For MVP: using the first restaurant the user has access to
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const fetchTables = useCallback(async (currentRestaurantId: string) => {
    try {
      const res = await fetch(`/api/admin/tables?restaurantId=${currentRestaurantId}`);
      const data = await res.json();
      if (data.tables) {
        setTables(data.tables);
      }
    } catch {
      setError("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch restaurant ID on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/restaurant");
        const data = await res.json();
        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
          await fetchTables(data.restaurantId);
        } else {
          setError("No restaurant found. Please set up your restaurant first.");
          setLoading(false);
        }
      } catch {
        setError("Failed to load restaurant info");
        setLoading(false);
      }
    }
    init();
  }, [fetchTables]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Step 7: Realtime subscription for session changes
  useEffect(() => {
    if (!restaurantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("table-sessions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "table_sessions",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          // Re-fetch tables when any session changes
          void fetchTables(restaurantId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, fetchTables]);

  async function handleOpenSession(tableId: string) {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        if (restaurantId) {
          await fetchTables(restaurantId);
        }
        // Show the OTP for the newly opened session
        const updated = tables.find((t) => t.id === tableId);
        if (updated) {
          setSelectedTable({
            ...updated,
            activeSession: data.session,
          });
        }
      }
    } catch {
      setError("Failed to open session");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCloseSession(sessionId: string) {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setSelectedTable(null);
        if (restaurantId) {
          await fetchTables(restaurantId);
        }
      }
    } catch {
      setError("Failed to close session");
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(ms: number) {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `${Math.max(1, minutes)}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  function formatRelativeTime(dateStr: string | null | undefined) {
    if (!dateStr) return "Never active";
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.max(0, Math.floor(diff / 60000));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getTableGroup(label: string): TableGroup {
    const normalized = label.toLowerCase();
    if (normalized.includes("patio")) return "Patio Tables";
    if (normalized.includes("bar")) return "Bar Tables";
    if (normalized.includes("private")) return "Private Dining";
    if (normalized.includes("table")) return "Normal Tables";
    return "Other Tables";
  }

  const activeTables = tables.filter((t) => t.activeSession);
  const idleTables = tables.filter((t) => !t.activeSession);
  const idleGroups = idleTables.reduce<Record<TableGroup, TableWithSession[]>>(
    (acc, table) => {
      acc[getTableGroup(table.label)].push(table);
      return acc;
    },
    {
      "Normal Tables": [],
      "Patio Tables": [],
      "Bar Tables": [],
      "Private Dining": [],
      "Other Tables": [],
    }
  );

  const groupOrder: TableGroup[] = [
    "Normal Tables",
    "Patio Tables",
    "Bar Tables",
    "Private Dining",
    "Other Tables",
  ];

  if (loading) {
    return (
      <div className="tables-loading">
        <div className="tables-spinner" />
        <p>Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="tables-page">

      {error && (
        <div className="tables-error" role="alert">
          {error}
          <button onClick={() => setError(null)} className="tables-error-dismiss">
            ✕
          </button>
        </div>
      )}

      {activeTables.length > 0 && (
        <section className="tables-section">
          <div className="tables-section-header">
            <h2 className="tables-section-title">Active tables</h2>
            <span className="tables-section-count">{activeTables.length}</span>
          </div>
          <div className="tables-grid tables-grid--full">
            {activeTables.map((table) => (
              <div
                key={table.id}
                className="table-card table-card--active table-card--full"
                onClick={() => setSelectedTable(table)}
              >
                <div className="table-card-main">
                  <div className="table-card-left">
                    <div className="table-card-status">
                      <span className="status-dot status-dot--active" />
                      <span className="status-label">Active</span>
                    </div>
                    <h3 className="table-card-label">{table.label}</h3>
                  </div>
                  <div className="table-card-right">
                    <span className="table-card-meta-label">Active for</span>
                    <span className="table-card-time">
                      {formatDuration(
                        now - new Date(table.activeSession!.opened_at).getTime()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {idleTables.length > 0 && (
        <section className="tables-section">
          <div className="tables-section-header">
            <h2 className="tables-section-title">Inactive tables</h2>
            <span className="tables-section-count">{idleTables.length}</span>
          </div>
          {groupOrder.map((group) => {
            const groupTables = idleGroups[group];
            if (groupTables.length === 0) return null;

            return (
              <div key={group} className="tables-group">
                <div className="tables-group-header">
                  <h3 className="tables-group-title">{group}</h3>
                  <span className="tables-group-count">{groupTables.length}</span>
                </div>
                <div className="tables-grid tables-grid--full">
                  {groupTables.map((table) => {
                    const lastSession = table.lastSession;
                    const lastActiveAt =
                      lastSession?.closed_at ?? lastSession?.opened_at;

                    return (
                      <div
                        key={table.id}
                        className="table-card table-card--idle table-card--full"
                        onClick={() => setSelectedTable(table)}
                      >
                        <div className="table-card-main">
                          <div className="table-card-left">
                            <div className="table-card-status">
                              <span className="status-dot status-dot--idle" />
                              <span className="status-label">Inactive</span>
                            </div>
                            <h3 className="table-card-label">{table.label}</h3>
                          </div>
                          <div className="table-card-right">
                            <span className="table-card-meta-label">Last active</span>
                            <span className="table-card-time">
                              {formatRelativeTime(lastActiveAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Table Detail Modal */}
      {selectedTable && (
        <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedTable(null)}
            >
              ✕
            </button>

            <h2 className="modal-title">{selectedTable.label}</h2>

            {selectedTable.activeSession ? (
              <div className="modal-session">
                <div className="otp-display">
                  <p className="otp-label">Table OTP</p>
                  <div className="otp-code">
                    {selectedTable.activeSession.otp.split("").map((d, i) => (
                      <span key={i} className="otp-digit">
                        {d}
                      </span>
                    ))}
                  </div>
                  <p className="otp-hint">
                    Share this code with the customers at this table
                  </p>
                </div>

                <div className="modal-session-info">
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <span className="info-value info-value--active">Active</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Opened at</span>
                    <span className="info-value">
                      {formatTime(selectedTable.activeSession.opened_at)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">OTP attempts</span>
                    <span className="info-value">
                      {selectedTable.activeSession.otp_attempts} / 5
                    </span>
                  </div>
                </div>

                <button
                  className="btn-close-session"
                  onClick={() =>
                    handleCloseSession(selectedTable.activeSession!.id)
                  }
                  disabled={actionLoading}
                >
                  {actionLoading ? "Closing…" : "Close Session"}
                </button>
              </div>
            ) : (
              <div className="modal-idle">
                <div className="idle-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <p className="idle-text">This table has no active session</p>
                <button
                  className="btn-open-session"
                  onClick={() => handleOpenSession(selectedTable.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Opening…" : "Open Table Session"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
