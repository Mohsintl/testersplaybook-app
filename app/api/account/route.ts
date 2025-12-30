export const runtime = "nodejs";

// This file defines the API route for managing user account details.
// It ensures proper authentication and allows fetching or updating account data.

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

  // Static account data for demonstration
  const account = {
    name: "John Doe",
    email: session.user.email,
    subscription: "Pro",
  };

  return NextResponse.json(account);
}