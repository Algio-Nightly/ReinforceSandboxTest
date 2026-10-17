import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ProblemSummary } from "../types";
import { api } from "../services/api";
import { Navbar } from "../components/Layout/Navbar";

export const DashboardPage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");

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

  const allTags = Array.from(new Set(problems.flatMap((p) => p.tags)));

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "All" ||
      p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    const matchesTag =
      tagFilter === "All" ||
      p.tags.some((t) => t.toLowerCase() === tagFilter.toLowerCase());
    return matchesSearch && matchesDifficulty && matchesTag;
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

  const getTagBadgeClass = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes("pytorch") || t.includes("torch")) return "badge-product";
    if (t.includes("numpy") || t.includes("scikit")) return "badge-kaggle";
    return "badge-category";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "48px 24px 80px", maxWidth: "1180px", margin: "0 auto", width: "100%" }}>
        {/* Reinforce Hero Section */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "20px",
              background: "rgba(245, 183, 49, 0.08)",
              border: "1px solid rgba(245, 183, 49, 0.25)",
              color: "var(--accent-gold)",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "18px",
              letterSpacing: "0.03em",
            }}
          >
            <span>REINFORCE SANDBOX</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ color: "#d1d5db" }}>AI/ML Club at SST</span>
          </div>

          <h1
            style={{
              fontSize: "44px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "16px",
              color: "#ffffff",
            }}
          >
            Code it, ship it,{" "}
            <span
              style={{
                color: "var(--accent-gold)",
                fontStyle: "italic",
                fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: "0 0 24px rgba(245, 183, 49, 0.35)",
              }}
            >
              get scored
            </span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              maxWidth: "620px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Real machine learning evaluations, algorithmic challenges, and tensor operations running in isolated sandboxes.
          </p>
        </div>

        {/* Search & Filter Bar - Dashboard Aesthetic */}
        <div
          style={{
            background: "var(--bg-secondary)",
            padding: "16px 20px",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "32px",
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "1 1 320px" }}>
            <input
              type="text"
              placeholder="Search by problem name, lead, tag, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
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

          {/* Filter Dropdowns */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                background: "#0d0e11",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "12px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="All">Any Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                background: "#0d0e11",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "12px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="All">Any Track</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Problems Grid - Matching the Dashboard Screenshot */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: "14px" }}>
            Loading challenges from sandbox...
          </div>
        ) : filteredProblems.length === 0 ? (
          <div
            className="reinforce-card"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "15px", marginBottom: "12px", color: "var(--text-secondary)" }}>
              No challenges found matching your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setDifficultyFilter("All");
                setTagFilter("All");
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {filteredProblems.map((prob) => {
              const primaryTag = prob.tags[0] || "ML";
              const secondaryTag = prob.tags[1] || "ALGORITHMS";

              return (
                <div
                  key={prob.id}
                  className="reinforce-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div>
                    {/* Top Badges Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                      <span className={`badge ${getTagBadgeClass(primaryTag)}`}>
                        {primaryTag}
                      </span>
                      <span className="badge badge-category">
                        {secondaryTag}
                      </span>
                      <span className={`badge ${getDifficultyBadge(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>
                      {prob.title}
                    </h3>

                    {/* Problem ID / Description */}
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>
                      Evaluate numerical convergence, stability, and gradient flow inside the Reinforce isolated sandbox.
                    </p>

                    {/* Metadata Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        paddingBottom: "18px",
                        marginBottom: "18px",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span>Public Tests</span>
                      <span>•</span>
                      <span>Hidden Grader</span>
                      <span>•</span>
                      <span style={{ color: "var(--accent-gold)" }}>Pytest Sandbox</span>
                    </div>
                  </div>

                  {/* Action Buttons Matching Dashboard */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link
                      to={`/problems/${prob.id}`}
                      className="btn btn-gold"
                      style={{
                        flex: 1,
                        padding: "9px 14px",
                        fontSize: "12px",
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      Solve Challenge ↗
                    </Link>
                    <Link
                      to={`/problems/${prob.id}`}
                      className="btn btn-secondary"
                      style={{
                        padding: "9px 14px",
                        fontSize: "12px",
                        textDecoration: "none",
                      }}
                    >
                      Specs
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
