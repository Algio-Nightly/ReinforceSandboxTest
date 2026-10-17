import React, { useState } from "react";
import type { SubmissionStatus } from "../../types";
import {
  CheckCircle2,
  XCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Clock,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";

interface TestResultsProps {
  submission: SubmissionStatus | null;
  submitting: boolean;
  error: string | null;
}

export const TestResults: React.FC<TestResultsProps> = ({
  submission,
  submitting,
  error,
}) => {
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedTests((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  if (!submission && !submitting && !error) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          padding: "20px",
          background: "var(--bg-secondary)",
        }}
      >
        <Terminal size={32} style={{ marginBottom: "10px", opacity: 0.5 }} />
        <p style={{ fontSize: "13px" }}>Hit "Submit Solution" to run your code against the evaluation sandbox.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100%",
          padding: "16px 20px",
          background: "var(--bg-secondary)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "14px 16px",
            borderRadius: "8px",
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            color: "#fca5a5",
          }}
        >
          <XCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>Execution Error</div>
            <div style={{ fontSize: "13px" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = submission?.status === "completed";
  const isRunning = submitting || submission?.status === "queued" || submission?.status === "running";

  const publicTests = submission?.public_tests || [];
  const hiddenTests = submission?.hidden_tests || [];
  const allTests = [...publicTests, ...hiddenTests];
  const passedCount = allTests.filter((t) => t.status === "passed").length;
  const totalCount = allTests.length;
  const passPercent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
  const isAllPassed = isCompleted && totalCount > 0 && passedCount === totalCount;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        overflowY: "auto",
      }}
    >
      {/* Status Header */}
      <div
        style={{
          padding: "12px 18px",
          background: "var(--bg-tertiary)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isRunning ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-purple)" }}>
              <Activity size={16} style={{ animation: "pulse 1.5s infinite" }} />
              <span style={{ fontWeight: 600, fontSize: "13px" }}>
                {submission?.status === "queued" ? "Queued in Sandbox..." : "Executing Pytest Grader..."}
              </span>
            </div>
          ) : isAllPassed ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)" }}>
              <CheckCircle2 size={16} />
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Accepted — All Tests Passed</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--error)" }}>
              <XCircle size={16} />
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Evaluation Finished — Some Tests Failed</span>
            </div>
          )}
        </div>

        {isCompleted && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Layers size={13} />
              <span>Score: <strong style={{ color: isAllPassed ? "var(--success)" : "#fff" }}>{passedCount}/{totalCount}</strong></span>
            </div>
            {submission?.execution_time_ms !== null && submission?.execution_time_ms !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Clock size={13} />
                <span>{submission.execution_time_ms} ms</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isCompleted && (
        <div style={{ height: "3px", width: "100%", background: "rgba(255,255,255,0.06)" }}>
          <div
            style={{
              height: "100%",
              width: `${passPercent}%`,
              background: isAllPassed ? "var(--success)" : "var(--accent-purple)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}

      {/* Test Items List */}
      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Public Tests */}
        {publicTests.length > 0 && (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              Public Tests ({publicTests.filter(t => t.status === "passed").length}/{publicTests.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {publicTests.map((t) => {
                const passed = t.status === "passed";
                const isExpanded = !!expandedTests[t.name];

                return (
                  <div
                    key={t.name}
                    style={{
                      borderRadius: "6px",
                      background: "var(--bg-primary)",
                      border: `1px solid ${passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.25)"}`,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => toggleExpand(t.name)}
                      style={{
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {passed ? (
                          <CheckCircle2 size={15} color="var(--success)" />
                        ) : (
                          <XCircle size={15} color="var(--error)" />
                        )}
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {t.name}
                          </div>
                          {t.docstring && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                              {t.docstring}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {t.duration_ms !== undefined && (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.duration_ms}ms</span>
                        )}
                        <span
                          className={`badge ${passed ? "badge-easy" : "badge-hard"}`}
                          style={{ padding: "2px 6px", fontSize: "10px" }}
                        >
                          {passed ? "Passed" : "Failed"}
                        </span>
                        {isExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expandable details: error message & stdout */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderTop: "1px solid var(--border-subtle)",
                          background: "#070a10",
                          fontSize: "12px",
                        }}
                      >
                        {t.message && (
                          <div style={{ marginBottom: t.stdout ? "8px" : "0" }}>
                            <div style={{ color: "var(--error)", fontWeight: 600, marginBottom: "4px" }}>
                              Assertion Error:
                            </div>
                            <pre
                              style={{
                                color: "#fca5a5",
                                background: "rgba(239, 68, 68, 0.08)",
                                padding: "8px 10px",
                                borderRadius: "4px",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {t.message}
                            </pre>
                          </div>
                        )}

                        {t.stdout && (
                          <div>
                            <div style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>
                              Captured Output:
                            </div>
                            <pre
                              style={{
                                color: "#94a3b8",
                                background: "rgba(255, 255, 255, 0.04)",
                                padding: "8px 10px",
                                borderRadius: "4px",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {t.stdout}
                            </pre>
                          </div>
                        )}

                        {!t.message && !t.stdout && (
                          <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                            Test executed successfully with no stdout output.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden Tests */}
        {hiddenTests.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Lock size={11} />
              <span>Hidden Tests ({hiddenTests.filter(t => t.status === "passed").length}/{hiddenTests.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {hiddenTests.map((t) => {
                const passed = t.status === "passed";

                return (
                  <div
                    key={t.name}
                    style={{
                      borderRadius: "6px",
                      background: "var(--bg-primary)",
                      border: `1px solid ${passed ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.2)"}`,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Lock size={13} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {t.name}
                        </div>
                        {t.docstring && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {t.docstring}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`badge ${passed ? "badge-easy" : "badge-hard"}`}
                      style={{ padding: "2px 6px", fontSize: "10px" }}
                    >
                      {passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
