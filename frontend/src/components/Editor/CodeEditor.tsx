import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";

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

    // Define custom dark theme matching the Reinforce warm charcoal palette
    monaco.editor.defineTheme("reinforce-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "71717a", fontStyle: "italic" },
        { token: "keyword", foreground: "f5b731" },
        { token: "number", foreground: "60a5fa" },
        { token: "string", foreground: "4ade80" },
        { token: "type", foreground: "facc15" },
        { token: "function", foreground: "e4e4e7" },
      ],
      colors: {
        "editor.background": "#0b0c0f",
        "editor.foreground": "#f4f4f6",
        "editorCursor.foreground": "#f5b731",
        "editor.lineHighlightBackground": "#16171d88",
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#f5b731",
        "editor.selectionBackground": "#f5b73133",
        "editor.inactiveSelectionBackground": "#f5b73118",
      },
    });

    monaco.editor.setTheme("reinforce-dark");

    // Register ML-specific autocompletions
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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0b0c0f" }}>
      {/* Editor Top Bar */}
      <div
        style={{
          height: "46px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.06em" }}>
            SOLUTION.PY
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
              background: "#22242a",
              color: "var(--accent-gold)",
              fontWeight: 600,
              border: "1px solid var(--border-subtle)",
            }}
          >
            Python 3.11
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ padding: "5px 12px", fontSize: "12px" }}
            title="Reset code to starter template"
          >
            Reset
          </button>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="btn btn-gold"
            style={{ padding: "6px 18px", fontSize: "12px" }}
          >
            {submitting ? "Evaluating in Sandbox..." : "Submit Solution ↗"}
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
    </div>
  );
};
