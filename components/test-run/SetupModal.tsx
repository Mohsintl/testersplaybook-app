"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from "@mui/material";

type Setup = {
  environment?: string;
  build?: string;
  credentials?: string;
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  tempSetup: Setup;
  setTempSetup: (s: Setup) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
};

export default function SetupModal({ open, onClose, tempSetup, setTempSetup, onConfirm, loading = false }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Execution Setup (optional)</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Provide execution setup details for this run, or skip to create the run without setup.
        </DialogContentText>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Execution Setup</Typography>

            <TextField
              label="Environment URL"
              fullWidth
              margin="normal"
              value={tempSetup.environment}
              onChange={(e) => setTempSetup({ ...tempSetup, environment: e.target.value })}
            />

            <TextField
              label="Build / Version"
              fullWidth
              margin="normal"
              value={tempSetup.build}
              onChange={(e) => setTempSetup({ ...tempSetup, build: e.target.value })}
            />

            <TextField
              label="Credentials"
              fullWidth
              margin="normal"
              value={tempSetup.credentials}
              onChange={(e) => setTempSetup({ ...tempSetup, credentials: e.target.value })}
            />

            <TextField
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={tempSetup.notes}
              onChange={(e) => setTempSetup({ ...tempSetup, notes: e.target.value })}
            />

          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? "Creating…" : "Create Run"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
