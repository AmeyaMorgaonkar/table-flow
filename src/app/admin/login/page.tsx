"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import "./login.css";

/**
 * Admin login page — email + password form.
 * No signup link (accounts are created by super admin only).
 * Uses React 19 useActionState for form state management.
 */
export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Branding */}
        <div className="login-header">
          <div className="login-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="login-icon"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h1 className="login-title">TableFlow</h1>
          <p className="login-subtitle">Staff Portal</p>
        </div>

        {/* Error message */}
        {state?.error && (
          <div className="login-error" role="alert" id="login-error">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="login-error-icon"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        {/* Login form */}
        <form action={formAction} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@restaurant.com"
              className="form-input"
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="form-input"
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            className="login-button"
            disabled={isPending}
          >
            {isPending ? (
              <span className="login-button-loading">
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="31.4 31.4"
                  />
                </svg>
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="login-footer">
          Contact your administrator for account access.
        </p>
      </div>
    </div>
  );
}
