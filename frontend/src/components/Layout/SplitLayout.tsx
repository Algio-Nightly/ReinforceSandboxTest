import React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

interface SplitLayoutProps {
  leftContent: React.ReactNode;
  editorContent: React.ReactNode;
  resultsContent: React.ReactNode;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftContent,
  editorContent,
  resultsContent,
}) => {
  return (
    <div style={{ flex: 1, height: "calc(100vh - 52px)", width: "100%", overflow: "hidden" }}>
      <Group orientation="horizontal" id="main-horizontal-group" style={{ height: "100%", width: "100%" }}>
        {/* Left: Problem Description Panel (42% default, between 20% and 70%) */}
        <Panel defaultSize="42%" minSize="20%" maxSize="70%" id="left-problem-panel">
          <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
            {leftContent}
          </div>
        </Panel>

        <Separator className="resize-handle resize-handle-horizontal" />

        {/* Right: Code Editor + Test Results Panel */}
        <Panel defaultSize="58%" minSize="30%" id="right-editor-group-panel">
          <Group orientation="vertical" id="right-vertical-group" style={{ height: "100%", width: "100%" }}>
            {/* Editor Pane (65% default, min 25%) */}
            <Panel defaultSize="65%" minSize="25%" id="top-editor-panel">
              <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
                {editorContent}
              </div>
            </Panel>

            <Separator className="resize-handle resize-handle-vertical" />

            {/* Test Results Drawer (35% default, min 15%) */}
            <Panel defaultSize="35%" minSize="15%" id="bottom-results-panel">
              <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
                {resultsContent}
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
};
