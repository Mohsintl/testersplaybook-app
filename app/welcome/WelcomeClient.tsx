"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function WelcomeClient() {
  const router = useRouter();

  return (
    <Stack spacing={3} alignItems="center" mt={8}>
      <Typography variant="h4" fontWeight={600}>
        Welcome to TestersPlaybook
      </Typography>

      <Typography color="text.secondary" align="center">
        You don’t have any projects or test runs yet.
      </Typography>

      <Button
        variant="contained"
        onClick={() => router.push("/projects/new")}
      >
        Create your first project
      </Button>

      <Typography variant="body2" color="text.secondary">
        If you were invited as a contributor, test runs will appear here once assigned.
      </Typography>
    </Stack>
  );
}
