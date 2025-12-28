"use client";

import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface ProjectLayoutProps {
  title: string;
  description: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  extraRightContent?: React.ReactNode; // Optional third component
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({
  title,
  description,
  leftContent,
  rightContent,
  extraRightContent,
}) => {
  return (
    
 <main className="w-full h-full border border-gray-300 rounded-md p-2  box-border">
  <h1 className="text-lg font-medium mb-4">{title}</h1>
  <p className="text-gray-600 mb-4">{description}</p>
  <ResizablePanelGroup direction="horizontal" className="border border-gray-300 rounded-md h-full">
    {/* Left Panel */}
    <ResizablePanel defaultSize={50} className="border-r border-gray-300 h-full">
      <div className="p-4 overflow-auto h-full box-border">{leftContent}</div>
    </ResizablePanel>
    <ResizableHandle className="bg-gray-600 hover:bg-gray-500 cursor-col-resize" />
    {/* Right Panel */}
    <ResizablePanel defaultSize={50} className="border-l border-gray-300 h-full">
      <ResizablePanelGroup
        direction="vertical"
        className="border border-gray-300 rounded-md h-full"
      >
        <ResizablePanel
          defaultSize={extraRightContent ? 50 : 100}
          className={extraRightContent ? "border-b border-gray-300 h-full" : "h-full"}
        >
          <div className="flex justify-center-safe  p-6 overflow-auto h-full box-border">
            {rightContent}
          </div>
        </ResizablePanel>
        {extraRightContent && (
          <>
            <ResizableHandle className="bg-gray-400 hover:bg-gray-600 cursor-row-resize" />
            <ResizablePanel defaultSize={50} className="border-t border-gray-300 h-full">
              <div className=" flex justify-center-safe p-6 overflow-auto h-full box-border">
                {extraRightContent}
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</main>
  )
};

export default ProjectLayout;