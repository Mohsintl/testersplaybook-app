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
import { useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

export default function InviteMember({
  projectId,
}: {
  projectId: string;
}) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Array<any>>([]);
  const [emailValid, setEmailValid] = useState<boolean>(true);

  useEffect(() => {
    if (open) fetchMembers();
  }, [open]);

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      }
    } catch (e) {
      // ignore
    }
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function sendInvite() {
    setError(null);
    setInviteLink(null);

<<<<<<< HEAD
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      setEmailValid(false);
      return;
    }

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
    setEmailValid(true);
    // refresh member list
    await fetchMembers();
=======
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
>>>>>>> recovered-branch
  }

  return (
    <Box mt={4}>
      <Button variant="outlined" onClick={() => setOpen((s) => !s)}>
        {open ? "Hide invite form" : "Invite Contributor"}
      </Button>

<<<<<<< HEAD
      {open && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Invite Contributor
          </Typography>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              size="small"
              label="Contributor email"
              value={email}
              error={!emailValid}
              helperText={!emailValid ? "Invalid email" : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailValid(true);
              }}
              fullWidth
            />
=======
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
>>>>>>> recovered-branch

            <Button variant="contained" onClick={sendInvite} disabled={loading}>
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

          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Project Contributors
          </Typography>
          <List>
            {members.length === 0 && (
              <ListItem>
                <ListItemText primary="No contributors found" />
              </ListItem>
            )}
            {members.map((m: any) => (
              <ListItem key={m.user?.id ?? m.id}>
                <ListItemText
                  primary={m.user?.name ?? m.user?.email ?? "Unknown"}
                  secondary={m.role ? `${m.role} • ${m.user?.email ?? ""}` : m.user?.email}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}
