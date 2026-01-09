"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  CircularProgress,
} from "@mui/material";

export default function WaitingPage() {
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkAssignment() {
      try {
        const res = await fetch("/api/me/assigned-test-runs");
        const json = await res.json();

        if (json.assigned) {
          router.replace("/entry");
        }
      } catch {
        // silent fail – try again next tick
      }
    }

    // initial check
    checkAssignment();

    // poll every 5 seconds
    interval = setInterval(checkAssignment, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <Box minHeight="100vh" display="flex" alignItems="center">
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress />

            <Typography variant="h6" fontWeight={600}>
              Waiting for assignment…
            </Typography>

            <Typography align="center" color="text.secondary">
              The project owner hasn’t assigned a test run yet.
              <br />
              This page will update automatically.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
