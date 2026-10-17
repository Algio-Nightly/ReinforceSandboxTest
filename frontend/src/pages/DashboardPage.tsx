import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ProblemSummary } from "../types";
import { api } from "../services/api";
import { Navbar } from "../components/Layout/Navbar";
import {
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  useEffect(() => {
    api.problems
      .list()
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load problems:", err);
        setLoading(false);
      });
  }, []);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "badge-easy";
      case "hard":
        return "badge-hard";
      default:
        return "badge-medium";
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "40px 24px", maxWidth: "1140px", margin: "0 auto", width: "100%" }}>
        {/* Hero Section */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#a5b4fc",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            <Sparkles size={14} color="var(--accent-purple)" />
            <span>Problem-Agnostic Machine Learning Judge</span>
          </div>

          <h1
            style={{
              fontSize: "38px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "12px",
              background: "linear-gradient(135deg, #fff 40%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Master Machine Learning by Building
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Implement fundamental ML algorithms, numerical routines, and deep learning operators in an isolated, sandboxed environment.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: "relative",
              flex: "1 1 300px",
              maxWidth: "400px",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search problems or tags (e.g. numpy, pytorch)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "8px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          {/* Difficulty Filter Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all var(--trans-fast)",
                  background:
                    selectedDifficulty === d
                      ? "var(--accent-indigo)"
                      : "var(--bg-secondary)",
                  color: selectedDifficulty === d ? "#fff" : "var(--text-secondary)",
                  borderColor:
                    selectedDifficulty === d
                      ? "var(--accent-indigo)"
                      : "var(--border-subtle)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            Loading problem catalog...
          </div>
        ) : filteredProblems.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "15px", marginBottom: "8px" }}>No problems found matching your criteria.</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedDifficulty("All");
              }}
              className="btn btn-secondary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
            {filteredProblems.map((prob) => (
              <Link
                key={prob.id}
                to={`/problems/${prob.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass-panel"
                  style={{
                    padding: "20px 22px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform var(--trans-fast), border-color var(--trans-fast), box-shadow var(--trans-fast)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "var(--border-accent)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span className={`badge ${getDifficultyBadge(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {prob.id}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>
                      {prob.title}
                    </h3>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                      {prob.tags.map((t) => (
                        <span key={t} className="badge badge-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "6px",
                      color: "var(--accent-purple)",
                      fontSize: "13px",
                      fontWeight: 600,
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <span>Solve Challenge</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
