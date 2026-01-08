"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";

/*
  InviteAcceptClient
  ------------------
  Client component that accepts an invitation token. Responsibilities:
  - If the user is not authenticated, trigger OAuth sign-in and return
  - POST the `token` to `/api/invitations/accept` to accept the invite
  - On success, navigate to `/projects` (forces a full reload to refresh session)

  This file contains UI and interaction logic only; server-side token
  validation and membership creation occur in the API route.
*/

export default function InviteAcceptClient({
  token,
}: {
  token: string;
}) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function acceptInvite() {
    setError(null);

    // 🔐 Not logged in → force login first
    if (status !== "authenticated") {
      await signIn("google", {
        callbackUrl: `/invite?token=${token}`,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to accept invite");
      }

      // ✅ FORCE FULL RELOAD (refreshes session)
      window.location.href = `/projects`;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Stack spacing={3} alignItems="center" mt={6}>
      <Typography variant="h5" fontWeight={600}>
        You’ve been invited to a project
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={acceptInvite}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Accept Invitation"}
      </Button>

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
    </Stack>
  );
}
