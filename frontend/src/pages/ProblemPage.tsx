import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProblem } from "../hooks/useProblem";
import { useSubmission } from "../hooks/useSubmission";
import { Navbar } from "../components/Layout/Navbar";
import { SplitLayout } from "../components/Layout/SplitLayout";
import { ProblemView } from "../components/ProblemView/ProblemView";
import { CodeEditor } from "../components/Editor/CodeEditor";
import { TestResults } from "../components/TestResults/TestResults";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export const ProblemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { problem, loading, error: problemError } = useProblem(id);
  const { submission, submitting, error: submitError, submitCode, clearSubmission } = useSubmission();

  const [code, setCode] = useState<string>("");

  // Sync starter code once problem loads or when user switches problems
  useEffect(() => {
    if (problem) {
      setCode(problem.starter_code);
      clearSubmission();
    }
  }, [problem?.id]);

  const handleReset = () => {
    if (problem && window.confirm("Reset your solution to the starter template?")) {
      setCode(problem.starter_code);
    }
  };

  const handleSubmit = () => {
    if (!id || !code.trim()) return;
    submitCode(id, code);
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          color: "var(--text-muted)",
          gap: "12px",
        }}
      >
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span>Loading problem workspace...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          padding: "20px",
        }}
      >
        <AlertCircle size={36} color="var(--error)" style={{ marginBottom: "16px" }} />
        <h2 style={{ marginBottom: "8px" }}>Problem Not Found</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          {problemError || `Problem "${id}" could not be located.`}
        </p>
        <Link to="/" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={14} />
          <span>Back to Problem List</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "var(--bg-primary)", overflow: "hidden" }}>
      <Navbar problemTitle={problem.title} />

      <SplitLayout
        leftContent={<ProblemView problem={problem} />}
        editorContent={
          <CodeEditor
            code={code}
            onChange={setCode}
            onReset={handleReset}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        }
        resultsContent={
          <TestResults
            submission={submission}
            submitting={submitting}
            error={submitError}
          />
        }
      />
    </div>
  );
};
