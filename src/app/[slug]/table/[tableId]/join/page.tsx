"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "./join.css";

/**
 * Customer OTP Entry page.
 * Large, mobile-friendly 4-digit code input.
 * On success → redirect to menu.
 * On failure → show error with remaining attempts.
 * On 5 failures → show "ask waiter" message.
 */
export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tableId = params.tableId as string;

  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
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

  async function handleSubmit(otpDigits?: string[]) {
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
        // Success — redirect to table page (which renders the menu)
        router.push(`/${slug}/table/${tableId}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="join-container">
      <div className="join-card">
        {/* Header */}
        <div className="join-header">
          <div className="join-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
          </div>
          <h1 className="join-title">Enter Table Code</h1>
          <p className="join-subtitle">
            Ask your waiter for the 4-digit code to start ordering
          </p>
        </div>

        {/* OTP Input */}
        {!locked ? (
          <>
            <div className="otp-inputs" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
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
                  id={`otp-digit-${i}`}
                />
              ))}
            </div>

            {error && (
              <div className="join-error" role="alert">
                {error}
              </div>
            )}

            {loading && (
              <div className="join-loading">
                <div className="join-spinner" />
                <span>Verifying…</span>
              </div>
            )}

            <button
              className="join-button"
              onClick={() => handleSubmit()}
              disabled={loading || digits.some((d) => d === "")}
              id="join-submit"
            >
              Join Table
            </button>
          </>
        ) : (
          <div className="join-locked">
            <div className="locked-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="locked-title">Too Many Attempts</h2>
            <p className="locked-text">
              Please ask your waiter for assistance.
              They can generate a new code for your table.
            </p>
          </div>
        )}

        {/* Browse menu link */}
        <div className="join-footer">
          <a href={`/${slug}/menu`} className="join-browse-link">
            Browse the menu without ordering →
          </a>
        </div>
      </div>
    </div>
  );
}
