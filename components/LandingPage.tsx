"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signIn } from "next-auth/react";

export default function LandingPage() {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      bgcolor="#f9fafb"
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Logo / Brand */}
            <Typography variant="h3" fontWeight={800} align="center">
              TestersPlaybook
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
            >
              AI-assisted test case creation, execution, and collaboration —
              built for developers and QA engineers.
            </Typography>

            {/* Value propositions */}
            <Stack spacing={1} width="100%">
              <Typography>✔ Capture real application behavior</Typography>
              <Typography>✔ Generate smarter test cases with AI</Typography>
              <Typography>✔ Run and track manual test executions</Typography>
              <Typography>✔ Collaborate with contributors effortlessly</Typography>
            </Stack>

            {/* CTA */}
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() =>
                signIn("google", { callbackUrl: "/entry" })
              }
              sx={{
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Sign in with Google
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
            >
              Free to start · No credit card required
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
