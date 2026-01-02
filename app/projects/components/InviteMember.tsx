"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

export default function InviteMember({
  projectId,
}: {
  projectId: string;
}) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendInvite() {
    setLoading(true);
    setError(null);
    setInviteLink(null);

    const res = await fetch(
      `/api/projects/${projectId}/invitations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email , role: "CONTRIBUTOR"}),
      }
    );

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Failed to send invite");
      return;
    }

    setInviteLink(json.inviteLink);
    setEmail("");
  }

  return (
    <Box mt={4}>
      <Typography variant="h6">Invite Contributor</Typography>

      <Box display="flex" gap={2} mt={2}>
        <TextField
          size="small"
          label="Contributor email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={sendInvite}
          disabled={loading}
        >
          Invite
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {inviteLink && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Invitation created. Share this link:
          <br />
          <strong>{inviteLink}</strong>
        </Alert>
      )}
    </Box>
  );
}
