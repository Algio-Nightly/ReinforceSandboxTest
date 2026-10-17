import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [isRegister, setIsRegister] = useState<boolean>(initialTab === "register");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err: any) {
      setError(
        err.message || "Google sign-in was cancelled or failed to authenticate."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        padding: "24px",
      }}
    >
      <div
        className="reinforce-card"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "36px 32px",
          background: "#15161b",
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              marginBottom: "16px",
            }}
          >
            <img
              src="/reinforce-logo.png"
              alt="Reinforce"
              style={{ height: "32px", width: "auto" }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: "18px",
                letterSpacing: "0.08em",
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              REINFORCE
            </span>
          </Link>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
            {isRegister ? "Create an Account" : "Sign In to Sandbox"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {isRegister
              ? "Access ML problem sets and track your evaluation ledger"
              : "Welcome back to the SST Reinforce ML Judge"}
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: "flex",
            borderRadius: "6px",
            background: "#0d0e11",
            padding: "3px",
            marginBottom: "24px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: "4px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all var(--trans-fast)",
              background: !isRegister ? "#202228" : "transparent",
              color: !isRegister ? "#ffffff" : "var(--text-muted)",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: "4px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all var(--trans-fast)",
              background: isRegister ? "#202228" : "transparent",
              color: isRegister ? "#ffffff" : "var(--text-muted)",
            }}
          >
            Register
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              color: "#fca5a5",
              fontSize: "12px",
              marginBottom: "18px",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isRegister && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aryan Mishra"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  background: "#0d0e11",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@sst.scaler.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                background: "#0d0e11",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                background: "#0d0e11",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold"
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          >
            {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ padding: "0 10px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: "100%", padding: "9px", fontSize: "13px" }}
        >
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};
