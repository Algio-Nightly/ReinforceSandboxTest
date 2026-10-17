import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Navbar: React.FC<{ problemTitle?: string }> = ({ problemTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: "56px",
        background: "#0d0e11",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 50,
      }}
    >
      {/* Brand & Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <img
            src="/reinforce-logo.png"
            alt="Reinforce"
            style={{ height: "26px", width: "auto" }}
          />
          <span
            style={{
              fontWeight: 800,
              fontSize: "15px",
              letterSpacing: "0.08em",
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            REINFORCE
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
              background: "var(--accent-gold-bg)",
              color: "var(--accent-gold)",
              border: "1px solid var(--accent-gold-border)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            SANDBOX
          </span>
        </Link>

        <div style={{ width: "1px", height: "16px", background: "var(--border-subtle)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Link
            to="/"
            style={{
              color: "#f4f4f6",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "color var(--trans-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#f4f4f6")}
          >
            Problems
          </Link>
          <a
            href="https://sst.scaler.com"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "color var(--trans-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Tracks
          </a>
        </div>

        {problemTitle && (
          <>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>/</span>
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-primary)",
                fontWeight: 600,
                maxWidth: "260px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {problemTitle}
            </span>
          </>
        )}
      </div>

      {/* Right User Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#1c1d22",
                padding: "4px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--accent-gold)",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                {(user.display_name || user.email)[0].toUpperCase()}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                {user.display_name || user.email.split("@")[0]}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn btn-secondary"
              style={{ padding: "5px 12px", fontSize: "12px" }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Sign In
            </Link>
            <Link to="/login?tab=register" className="btn btn-gold" style={{ padding: "6px 16px", fontSize: "12px" }}>
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
