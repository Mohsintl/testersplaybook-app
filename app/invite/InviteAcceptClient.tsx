"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import router from "next/router";

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
      router.push("/projects");
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
