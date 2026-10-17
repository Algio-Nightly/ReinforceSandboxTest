import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { RotateCcw, Play, Loader2, Code2 } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onReset: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onReset,
  onSubmit,
  submitting,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom dark cyber theme matching our palette
    monaco.editor.defineTheme("ml-judge-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "a855f7" },
        { token: "number", foreground: "38bdf8" },
        { token: "string", foreground: "34d399" },
        { token: "type", foreground: "818cf8" },
        { token: "function", foreground: "60a5fa" },
      ],
      colors: {
        "editor.background": "#0b0f19",
        "editor.foreground": "#f8fafc",
        "editorCursor.foreground": "#a855f7",
        "editor.lineHighlightBackground": "#161d2d55",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94a3b8",
        "editor.selectionBackground": "#6366f133",
        "editor.inactiveSelectionBackground": "#6366f120",
      },
    });

    monaco.editor.setTheme("ml-judge-dark");

    // Register ML-specific autocompletions for numpy, torch, scikit-learn
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // NumPy
          {
            label: "np.exp",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "np.exp(${1:x})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Calculate the exponential of all elements in the input array.",
            range,
          },
          {
            label: "np.maximum",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "np.maximum(${1:x1}, ${2:x2})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Element-wise maximum of array elements.",
            range,
          },
          {
            label: "np.sum",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "np.sum(${1:a}, axis=${2:-1}, keepdims=${3:True})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Sum of array elements over a given axis.",
            range,
          },
          {
            label: "np.linalg.pinv",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "np.linalg.pinv(${1:a})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Compute the (Moore-Penrose) pseudo-inverse of a matrix.",
            range,
          },
          // PyTorch
          {
            label: "torch.tensor",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "torch.tensor(${1:data}, dtype=${2:torch.float32})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Constructs a tensor with data.",
            range,
          },
          {
            label: "torch.where",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "torch.where(${1:condition}, ${2:x}, ${3:y})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Return a tensor of elements selected from either x or y, depending on condition.",
            range,
          },
          {
            label: "nn.Module",
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: "nn.Module",
            documentation: "Base class for all neural network modules in PyTorch.",
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0b0f19" }}>
      {/* Editor Top Bar */}
      <div
        style={{
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Code2 size={16} color="var(--accent-purple)" />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>
            SOLUTION.PY
          </span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "4px",
              background: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              fontWeight: 500,
            }}
          >
            Python 3.11
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ padding: "5px 10px", fontSize: "12px" }}
            title="Reset code to starter template"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: "6px 16px", fontSize: "12px" }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play size={13} fill="#fff" />
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Container */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
            fontSize: 13.5,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            renderLineHighlight: "all",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
