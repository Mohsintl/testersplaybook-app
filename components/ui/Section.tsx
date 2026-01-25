"use client";

import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ title, children, className }: Props) {
  return (
    <div className={className} style={{ marginTop: 12 }}>
      <h4>{title}</h4>
      <div>{children}</div>
    </div>
  );
}
