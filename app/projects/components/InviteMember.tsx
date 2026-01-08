"use client";

/*
  InviteMember
  ------------
  Small client component used within project settings to send email
  invitations. Includes basic client-side validation for email format.
*/
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

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function sendInvite() {
    setError(null);
    setInviteLink(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "CONTRIBUTOR" }),
      });

      const json = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(json.error || "Failed to send invite");
        return;
      }

      setInviteLink(json.inviteLink);
      setEmail("");
    } catch (err) {
      setLoading(false);
      setError("Failed to send invite");
    }
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
          error={!!error || (email.length > 0 && !isValidEmail(email))}
          helperText={
            error ? error : email.length > 0 && !isValidEmail(email) ? "Enter a valid email" : undefined
          }
        />

        <Button
          variant="contained"
          onClick={sendInvite}
          disabled={loading || !isValidEmail(email)}
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
