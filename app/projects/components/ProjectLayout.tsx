"use client";
import ResponsiveAppBar from "./ResponsiveAppBar";
import Container from "@mui/material/Container";
import React from "react";

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
    <main className="w-full h-full border border-gray-300 rounded-md p-2 box-border">
      <ResponsiveAppBar />
      <div className="w-full h-full border border-gray-300 rounded-md p-2 box-border">
        <h1 className="text-lg font-medium mb-4">{title}</h1>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left Content */}
          {leftContent && (
            <div className="flex-1 border border-gray-300 rounded-md p-4">
              {leftContent}
            </div>
          )}

          {/* Right Content and Extra Right Content */}
          {(rightContent || extraRightContent) && (
            <div className="flex flex-col flex-1 gap-4">
              {rightContent && (
                <div className="border border-gray-300 rounded-md p-4">
                  {rightContent}
                </div>
              )}
              {extraRightContent && (
                <div className="border border-gray-300 rounded-md p-4">
                  {extraRightContent}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProjectLayout;