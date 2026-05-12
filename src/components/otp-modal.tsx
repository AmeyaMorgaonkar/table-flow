"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "@/lib/session-context";
import "./otp-modal.css";

type ModalState = "choice" | "otp";

interface OtpModalProps {
  /** Whether to show the modal */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Which state to start in */
  initialState?: ModalState;
  /** Table ID for the session join */
  tableId: string;
  /** Optional action to execute after successful OTP entry */
  pendingAction?: (() => void) | null;
}

/**
 * OTP Modal with two states:
 *
 * State A (choice): "Ready to order?" with "Enter OTP" and "Just Browsing" buttons.
 * State B (otp): 4-digit OTP input, submit to /api/session/join.
 *
 * Pending action pattern: on successful OTP, calls pendingAction() automatically.
 */
export function OtpModal({
  isOpen,
  onClose,
  initialState = "choice",
  tableId,
  pendingAction,
}: OtpModalProps) {
  const { setSession } = useSession();
  const [state, setState] = useState<ModalState>(initialState);
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevIsOpenRef = useRef(false);

  // Reset state when modal transitions from closed to open.
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setState(initialState);
      setDigits(["", "", "", ""]);
      setError(null);
      setLoading(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialState]);

  // Auto-focus first OTP input when switching to otp state
  useEffect(() => {
    if (isOpen && state === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, state]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 3 && newDigits.every((d) => d !== "")) {
      handleSubmit(newDigits);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (pasted.length === 4) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      inputRefs.current[3]?.focus();
      handleSubmit(newDigits);
    }
  }

  const handleSubmit = useCallback(
    async (otpDigits?: string[]) => {
      const otp = (otpDigits || digits).join("");
      if (otp.length !== 4) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/session/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableId, otp }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.attemptsRemaining === 0) {
            setLocked(true);
          }
          setError(data.error);
          setDigits(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        } else {
          // Success — update session context
          setSession(data.session.id);
          onClose();

          // Execute pending action if provided
          if (pendingAction) {
            setTimeout(() => pendingAction(), 50);
          }
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [digits, tableId, setSession, onClose, pendingAction]
  );

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div
        className="otp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="OTP Entry"
      >
        {/* Close button */}
        <button
          className="otp-modal-close"
          onClick={onClose}
          aria-label="Close"
          id="otp-modal-close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {state === "choice" && !locked ? (
          /* ── State A: Choice Prompt ── */
          <div className="otp-modal-choice">
            <div className="otp-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="otp-modal-title">Ready to order?</h2>
            <p className="otp-modal-desc">
              Enter the code from your waiter to start placing orders, or keep browsing the menu.
            </p>
            <div className="otp-modal-actions">
              <button
                className="otp-btn otp-btn-primary"
                onClick={() => setState("otp")}
                id="otp-enter-code"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Enter OTP to Order
              </button>
              <button
                className="otp-btn otp-btn-secondary"
                onClick={onClose}
                id="otp-just-browsing"
              >
                Just Browsing
              </button>
            </div>
          </div>
        ) : locked ? (
          /* ── Locked state ── */
          <div className="otp-modal-locked">
            <div className="otp-modal-icon otp-modal-icon--locked">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="otp-modal-title">Too Many Attempts</h2>
            <p className="otp-modal-desc">
              Please ask your waiter for assistance. They can generate a new code for your table.
            </p>
          </div>
        ) : (
          /* ── State B: OTP Entry ── */
          <div className="otp-modal-entry">
            <div className="otp-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <h2 className="otp-modal-title">Enter Table Code</h2>
            <p className="otp-modal-desc">
              Ask your waiter for the 4-digit code
            </p>

            <div className="otp-inputs" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`otp-input ${error ? "otp-input--error" : ""}`}
                  disabled={loading}
                  aria-label={`Digit ${i + 1}`}
                  id={`otp-modal-digit-${i}`}
                />
              ))}
            </div>

            {error && (
              <div className="otp-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            {loading && (
              <div className="otp-loading">
                <div className="otp-spinner" />
                <span>Verifying…</span>
              </div>
            )}

            <button
              className="otp-btn otp-btn-primary otp-btn-full"
              onClick={() => handleSubmit()}
              disabled={loading || digits.some((d) => d === "")}
              id="otp-modal-submit"
            >
              Verify Code
            </button>

            <button
              className="otp-back-btn"
              onClick={() => {
                setState("choice");
                setDigits(["", "", "", ""]);
                setError(null);
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
