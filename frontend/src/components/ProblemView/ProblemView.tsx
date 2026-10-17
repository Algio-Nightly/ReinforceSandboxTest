import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { ProblemDetail } from "../../types";
import { Tag, AlertCircle } from "lucide-react";

interface ProblemViewProps {
  problem: ProblemDetail;
}

export const ProblemView: React.FC<ProblemViewProps> = ({ problem }) => {
  const getDifficultyClass = (diff: string) => {
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
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "24px 28px",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Problem Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <span className={`badge ${getDifficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.tags.map((tag) => (
            <span key={tag} className="badge badge-tag">
              <Tag size={10} style={{ marginRight: "3px" }} />
              {tag}
            </span>
          ))}
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 16px 0", color: "#fff" }}>
          {problem.title}
        </h1>

        <div style={{ width: "100%", height: "1px", background: "var(--border-subtle)" }} />
      </div>

      {/* Problem Description with LaTeX & Markdown */}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
        >
          {problem.description_markdown}
        </ReactMarkdown>
      </div>

      {/* Constraints section */}
      {problem.constraints && (
        <div
          style={{
            marginTop: "28px",
            padding: "16px",
            borderRadius: "8px",
            background: "rgba(99, 102, 241, 0.05)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--accent-purple)", fontWeight: 600, fontSize: "13px" }}>
            <AlertCircle size={15} />
            <span>Constraints & Bounds</span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 0,
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
            }}
          >
            {problem.constraints}
          </pre>
        </div>
      )}
    </div>
  );
};
