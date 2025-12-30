export const runtime = "nodejs";

// This file defines the API route for fetching blog posts.
// It returns a list of static blog posts for demonstration purposes.

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