/*
  API: Blog (demo)
  ----------------
  Simple demo endpoint that returns static blog posts. Kept for
  documentation and sample content; not part of core app logic.
*/
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  // Static blog data
  const blogs = [
    { id: 1, title: "Welcome to our Blog", content: "This is the first post." },
    { id: 2, title: "Next.js Tips", content: "Learn how to use Next.js effectively." },
    { id: 3, title: "Scaling Your App", content: "Best practices for scaling your application." },
  ];

  return NextResponse.json(blogs);
}