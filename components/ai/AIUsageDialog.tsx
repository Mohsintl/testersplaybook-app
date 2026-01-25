"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  message?: string | null;
  remaining?: number | null;
  upgradeHref?: string;
};

export default function AIUsageDialog({
  open,
  onClose,
  message,
  remaining = null,
  upgradeHref = "/pricing",
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>AI Usage Limit Reached</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message ?? "You've reached your AI usage limit for today."}
        </DialogContentText>
        {remaining !== null && (
          <DialogContentText sx={{ mt: 1 }}>
            Remaining calls: {remaining}
          </DialogContentText>
        )}
        <DialogContentText sx={{ mt: 1 }}>
          You can wait until your quota resets or upgrade to increase limits.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button component="a" href={upgradeHref} variant="contained">
          Upgrade
        </Button>
      </DialogActions>
    </Dialog>
  );
}
