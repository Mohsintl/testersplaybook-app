import React from "react";

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
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Left side */}
        <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200 md:w-1/2">
          <h1 className="text-lg font-medium mb-4">{title}</h1>
          <p className="text-gray-600 mb-4">{description}</p>
          {leftContent}
        </div>

        {/* Right side */}
        <div className="flex-1 p-4 md:w-1/2">{rightContent}</div>
      </div>
    </main>
  );
};

export default ProjectLayout;