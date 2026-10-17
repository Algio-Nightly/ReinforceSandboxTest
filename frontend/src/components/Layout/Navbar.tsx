import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { BrainCircuit, LogOut, User as UserIcon, ListChecks } from "lucide-react";

export const Navbar: React.FC<{ problemTitle?: string }> = ({ problemTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: "52px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        zIndex: 50,
      }}
    >
      {/* Brand & Problem link */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "var(--grad-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrainCircuit size={16} color="#fff" />
          </div>
          <span>ML<span style={{ color: "var(--accent-indigo)" }}>Judge</span></span>
        </Link>

        <div style={{ width: "1px", height: "18px", background: "var(--border-subtle)" }} />

        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "13px",
            transition: "color var(--trans-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <ListChecks size={15} />
          <span>Problems</span>
        </Link>

        {problemTitle && (
          <>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-primary)",
                fontWeight: 500,
                maxWidth: "280px",
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

      {/* User Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-tertiary)",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "var(--accent-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserIcon size={12} color="#fff" />
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                {user.display_name || user.email.split("@")[0]}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn btn-secondary"
              style={{ padding: "5px 10px", fontSize: "12px" }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Sign In
            </Link>
            <Link to="/login?tab=register" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
