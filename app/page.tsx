"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already logged in → go to projects
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/projects");
    }
  }, [status, router]);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      bgcolor="#fafafa"
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 5 }}>
          <Stack spacing={3} alignItems="center">
            {/* Logo / Title */}
            <Typography variant="h4" fontWeight={700} align="center">
              TestersPlaybook
            </Typography>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              align="center"
            >
              AI-assisted test case management and execution for
              developers, QA engineers, and small teams.
            </Typography>

            {/* Value props */}
            <Stack spacing={1} width="100%">
              <Typography>• Write better test cases with AI</Typography>
              <Typography>• Capture real application behavior</Typography>
              <Typography>• Run and track manual test executions</Typography>
            </Stack>

            {/* CTA */}
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() =>
                signIn("google", { callbackUrl: "/projects" })
              }
              sx={{
                mt: 2,
                width: "100%",
                textTransform: "none",
              }}
            >
              Sign in with Google
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
            >
              No credit card required · Free to start
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
