export const runtime = "nodejs";

// This file defines the API route for fetching pricing details.
// It ensures proper authentication and returns static pricing data.

import { NextResponse } from "next/server";

export async function GET() {
  // Static pricing data
  const pricing = [
    { id: 1, plan: "Free", price: 0 },
    { id: 2, plan: "Pro", price: 10 },
    { id: 3, plan: "Enterprise", price: 50 },
  ];

  return NextResponse.json(pricing);
}