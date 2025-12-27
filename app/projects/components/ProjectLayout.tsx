"use client";

import React from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

interface ProjectLayoutProps {
  title: string;
  description: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({
  title,
  description,
  leftContent,
  rightContent,
}) => {
  return (
    <main>
      <h1 className="text-lg font-medium mb-4">{title}</h1>
      <p className="text-gray-600 mb-4">{description}</p>
      <PanelGroup direction="horizontal">
        {/* Left Panel */}
        <Panel className="p-4 border-r border-gray-200">{leftContent}</Panel>
        <PanelResizeHandle className="w-2 bg-gray-300 cursor-col-resize" />
        {/* Right Panel */}
        <Panel className="p-4">{rightContent}</Panel>
      </PanelGroup>
    </main>
  );
};

export default ProjectLayout;