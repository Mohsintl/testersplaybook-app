export const runtime = "nodejs";

// This file defines the API route for fetching dashboard data.
// It ensures proper authentication and returns static dashboard data.

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Static dashboard data for demonstration
  const dashboard = {
    projects: 5,
    tasks: 20,
    notifications: 3,
  };

  return NextResponse.json(dashboard);
}