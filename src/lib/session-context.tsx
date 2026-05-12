"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface SessionContextValue {
  hasSession: boolean;
  sessionId: string | null;
  setSession: (sessionId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Provider to track customer session state (whether they've entered OTP).
 * Starts with server-checked initial value, updates on successful OTP entry.
 */
export function SessionProvider({
  initialHasSession,
  initialSessionId,
  children,
}: {
  initialHasSession: boolean;
  initialSessionId: string | null;
  children: React.ReactNode;
}) {
  const [hasSession, setHasSession] = useState(initialHasSession);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);

  const setSession = useCallback((newSessionId: string) => {
    setSessionId(newSessionId);
    setHasSession(true);
  }, []);

  return (
    <SessionContext.Provider value={{ hasSession, sessionId, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to access current session state.
 * Must be used within a SessionProvider.
 */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
